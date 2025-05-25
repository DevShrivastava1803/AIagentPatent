import os
import pandas as pd
from sentence_transformers import SentenceTransformer
from chromadb import PersistentClient

# Step 1: Path to your dataset
data_dir = "C:/Users/ishak/OneDrive/Desktop/data"

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

# Step 4: Generate embeddings
model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(texts, show_progress_bar=True)

# Step 5: Initialize ChromaDB client with persistent storage (new way)
client = PersistentClient(path="C:/Users/ishak/OneDrive/Desktop/MINOR 2B/AIagentPatent/Backend/app/services/chroma_db")



# Step 6: Add data in batches to avoid ChromaDB's max batch size error
collection = client.get_or_create_collection(name="patent_data")
batch_size = 5000
for start in range(0, len(texts), batch_size):
    end = start + batch_size
    print(f"✅ Inserting batch {start} to {end}...")

    collection.add(
        documents=texts[start:end],
        embeddings=embeddings[start:end],
        ids=[str(i) for i in range(start, end)],
        metadatas=[
            {
                "source_file": combined_df["source_file"].iloc[i],
                "title": combined_df["Title"].iloc[i],
                "date": combined_df["Application Date"].iloc[i],
                "assignee": combined_df["Applicant Name"].iloc[i]
            }
            for i in range(start, end)
        ]
    )


print("✅ All data has been stored in ChromaDB!")
