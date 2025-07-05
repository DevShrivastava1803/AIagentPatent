import os
try:
    import pandas as pd
except ImportError:
    print("pandas not installed. Please install it with: pip install pandas")
    exit(1)

from chromadb import PersistentClient
from app.services.get_embedding_function import get_embedding_function

# Step 1: Path to your dataset
data_dir = "C:/Users/ishak/OneDrive/Desktop/data" # This should be parameterized or moved to config

# Step 2: Load and combine all CSVs
csv_files = [f for f in os.listdir(data_dir) if f.endswith(".csv")]

combined_df = pd.DataFrame()
for file in csv_files:
    df = pd.read_csv(os.path.join(data_dir, file))
    df["source_file"] = file
    combined_df = pd.concat([combined_df, df], ignore_index=True)

# Step 3: Prepare text for embedding
texts = (
    combined_df["Title"].fillna('') + " - " +
    combined_df["Field Of Invention"].fillna('')
).tolist()

# Step 4: Generate embeddings using the unified embedding function
print("Initializing embedding function...")
embedding_fn = get_embedding_function()
# The embed_documents method is expected for lists of texts.
# This might be slow for very large datasets; consider batching calls to embed_documents if necessary,
# or if the API supports larger batches directly. For now, let's assume it handles a large list.
print("Generating embeddings for all texts. This may take a while...")
embeddings = embedding_fn.embed_documents(texts)
print(f"Generated {len(embeddings)} embeddings.")

# Step 5: Initialize ChromaDB client with persistent storage using consistent path
CHROMA_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))
print(f"Using ChromaDB path: {CHROMA_DB_PATH}")
# Ensure the parent directory exists if ChromaDB doesn't create it
os.makedirs(CHROMA_DB_PATH, exist_ok=True) # Make sure directory exists
client = PersistentClient(path=CHROMA_DB_PATH)

# Step 6: Add data in batches to avoid ChromaDB's max batch size error
# Ensure the collection name is consistent if it needs to be accessed elsewhere,
# e.g., "patent_data" or the default collection name used by ChromaConnector.
# ChromaConnector uses "langchain" by default if not specified. Let's use a specific name.
COLLECTION_NAME = "patent_data"
collection = client.get_or_create_collection(name=COLLECTION_NAME)  # Don't pass embedding function to ChromaDB


batch_size = 5000 # ChromaDB's default max batch size is large, but explicit batching is safer.
for start in range(0, len(texts), batch_size):
    end = min(start + batch_size, len(texts)) # Ensure 'end' doesn't exceed list length
    current_batch_texts = texts[start:end]
    current_batch_embeddings = embeddings[start:end]
    current_batch_ids = [str(i) for i in range(start, end)]
    current_batch_metadatas = [
            {
                "source_file": combined_df["source_file"].iloc[i],
                "title": combined_df["Title"].iloc[i],
                "date": combined_df["Application Date"].iloc[i], # Ensure this column name is correct
                "assignee": combined_df["Applicant Name"].iloc[i] # Ensure this column name is correct
            }
            for i in range(start, end)
        ]

    print(f"✅ Inserting batch from index {start} to {end-1} (Size: {len(current_batch_texts)})...")

    if not current_batch_texts:
        print("Skipping empty batch.")
        continue

    collection.add(
        documents=current_batch_texts,
        embeddings=current_batch_embeddings,  # type: ignore
        ids=current_batch_ids,
        metadatas=current_batch_metadatas  # type: ignore
    )

# Verify collection count
print(f"Collection '{COLLECTION_NAME}' now has {collection.count()} documents.")
print("✅ All data has been stored in ChromaDB!")
