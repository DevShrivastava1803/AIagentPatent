# app/services/vector_db/chroma_connector.py
import os
from chromadb import PersistentClient
from typing import Optional

class ChromaConnector:
    def __init__(self, collection_name: str = "langchain"):
        # Use the same path as process.py
        CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db"))
        self.client = PersistentClient(path=CHROMA_PATH)
        self.collection_name = collection_name
        # Use the same collection that langchain_chroma uses (default is "langchain")
        self.collection = self.client.get_or_create_collection("langchain")

    def get_latest_document_text(self) -> Optional[str]:
        try:
            result = self.collection.peek(limit=1)
            if not result["documents"]:
                return None
            return result["documents"][0]
        except Exception as e:
            print(f"Error fetching document: {e}")
            return None

    def close(self):
        # ChromaDB client doesn't need explicit closing
        pass

# This allows both the class and function to be imported
__all__ = ['ChromaConnector', 'get_latest_document_text']