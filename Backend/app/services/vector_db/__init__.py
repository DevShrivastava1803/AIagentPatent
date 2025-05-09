# vector_db/__init__.py

import chromadb

# Initialize Chroma client
client = chromadb.Client()

# Create or get an existing collection
collection_name = "patent_embeddings"
collection = client.get_or_create_collection(collection_name)
