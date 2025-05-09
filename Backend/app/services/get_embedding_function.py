import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_embedding_function():
    """Returns Google Gemini embedding function."""
    os.environ["GOOGLE_API_KEY"] = "AIzaSyDLnLfQIfe_1KElpgR2a9kNAUuXNSSFePg" 
    return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
