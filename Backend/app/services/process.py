import os
from langchain.schema import Document
from app.services.get_embedding_function import get_embedding_function
from app.services.load_documents import load_and_split_pdf
from langchain_chroma import Chroma

CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))

def calculate_chunk_ids(chunks):
    """Generate unique IDs for each chunk based on source and page."""
    last_page_id = None
    current_chunk_index = 0
    updated_chunks = []

    for chunk in chunks:
        source = chunk.metadata.get("source", "unknown")
        page = chunk.metadata.get("page", "0")
        current_page_id = f"{source}:{page}"

        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id

        updated_chunks.append(Document(
            page_content=chunk.page_content,
            metadata={**chunk.metadata, "id": chunk_id}
        ))

    return updated_chunks

def process_pdf_to_chroma(pdf_filename: str):
    """Full pipeline: load PDF → split → embed → store in ChromaDB."""
    chunks = load_and_split_pdf(pdf_filename)
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    chunks_with_ids = calculate_chunk_ids(chunks)
    for chunk in chunks_with_ids:
     print("📄 ID:", chunk.metadata["id"])
     print("📄 Content Preview:", chunk.page_content[:150])
     print("----------")

    # Get existing IDs to avoid duplicates
    existing_ids = set(db.get(include=[])["ids"])
    new_chunks = []
    print(f"🔍 Total chunks after splitting: {len(chunks)}")

    for chunk in chunks_with_ids:

        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append({
                "page_content": chunk.page_content,
                "metadata": chunk.metadata
            })
        print("📄 Chunk:", chunk.metadata["id"], chunk.page_content[:100])

    if new_chunks:
        print(f"🆕 Adding {len(new_chunks)} new chunks to ChromaDB...")
        db.add_texts(
            texts=[chunk["page_content"] for chunk in new_chunks],
            metadatas=[chunk["metadata"] for chunk in new_chunks],
            ids=[chunk["metadata"]["id"] for chunk in new_chunks]
        )
        print("✅ ChromaDB updated.")
    else:
        print("✔️ No new chunks to add. ChromaDB is up-to-date.")


