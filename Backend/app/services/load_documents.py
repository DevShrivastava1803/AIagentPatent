import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document

def load_and_split_pdf(pdf_filename: str):
    """
    Loads a PDF document from the `data` folder and splits it into smaller chunks.
    Returns a list of LangChain Document objects.
    """
    # The pdf_filename argument is expected to be the full path to the PDF.
    if not os.path.exists(pdf_filename):
        raise FileNotFoundError(f"ERROR: File not found at {pdf_filename}")

    # Load and split
    loader = PyPDFLoader(pdf_filename) # Use pdf_filename directly
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=80,
        length_function=len
    )
    chunks = text_splitter.split_documents(documents)

    return chunks
