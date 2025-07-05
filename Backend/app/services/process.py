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
        source_full_path = chunk.metadata.get("source", "unknown")
        filename_base = os.path.basename(source_full_path)
        page = chunk.metadata.get("page", "0")
        current_page_id = f"{source_full_path}:{page}" # Keep original source for page ID if needed

        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id

        # Add filename_base to metadata for easier querying by basename
        new_metadata = {
            **chunk.metadata,
            "id": chunk_id,
            "filename_base": filename_base
        }

        updated_chunks.append(Document(
            page_content=chunk.page_content,
            metadata=new_metadata
        ))

    return updated_chunks

def process_pdf_to_chroma(pdf_filename: str):
    """Full pipeline: load PDF → split → embed → store in ChromaDB."""
    chunks = load_and_split_pdf(pdf_filename)
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    chunks_with_ids = calculate_chunk_ids(chunks)
    
    # Get existing IDs to avoid duplicates
    existing_ids = set(db.get(include=[])["ids"])
    new_chunks = []
    print(f"📄 Processing {len(chunks)} document chunks...")

    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append({
                "page_content": chunk.page_content,
                "metadata": chunk.metadata
            })

    if new_chunks:
        print(f"💾 Storing {len(new_chunks)} new chunks in database...")
        db.add_texts(
            texts=[chunk["page_content"] for chunk in new_chunks],
            metadatas=[chunk["metadata"] for chunk in new_chunks],
            ids=[chunk["metadata"]["id"] for chunk in new_chunks]
        )
        print("✅ Document processed successfully!")
    else:
        print("✅ Document already exists in database.")

    # Return the basename of the PDF file, which can serve as a document_id
    return os.path.basename(pdf_filename)
