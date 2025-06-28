import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_embedding_function():
    """
    Returns Google Gemini embedding function.
    Relies on GOOGLE_API_KEY environment variable being set.
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    # The GoogleGenerativeAIEmbeddings class will internally use this environment variable
    # or you can pass it explicitly: GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=api_key)
    # Langchain typically checks os.environ["GOOGLE_API_KEY"] automatically.
    return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
