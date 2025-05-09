import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document

def load_and_split_pdf(pdf_filename: str):
    """
    Loads a PDF document from the `data` folder and splits it into smaller chunks.
    Returns a list of LangChain Document objects.
    """
    # Build full path to PDF
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    pdf_path = os.path.join(base_dir, pdf_filename)

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"ERROR: File not found at {pdf_path}")

    # Load and split
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=80,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)

    return chunks
