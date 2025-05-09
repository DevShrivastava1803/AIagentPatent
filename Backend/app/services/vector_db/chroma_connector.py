# app/services/vector_db/chroma_connector.py
from chromadb import Client
from typing import Optional

class ChromaConnector:
    def __init__(self, collection_name: str = "patent_embeddings"):
        self.client = Client()
        self.collection_name = collection_name
        self.collection = self.client.get_or_create_collection(collection_name)

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
        self.client.close()

# This allows both the class and function to be imported
__all__ = ['ChromaConnector', 'get_latest_document_text']