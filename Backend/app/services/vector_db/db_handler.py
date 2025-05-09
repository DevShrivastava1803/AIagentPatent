import os
from langchain.prompts import ChatPromptTemplate
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAI
from app.services.get_embedding_function import get_embedding_function
import chromadb
from langchain_chroma import Chroma

# vector_db/db_handler.py
# Initialize Chroma Client (as you did in __init__.py)
# client = chromadb.Client()
# collection = client.get_or_create_collection("patent_embeddings")
# # Function to add document embeddings to Chroma
# def add_document_to_vector_db(doc_text: str, document_id: str):
#     embeddings = GoogleEmbeddings().embed_documents([doc_text])  # Example using LangChain's Google Embeddings
#     # Store the embeddings in Chroma database
#     collection.add(
#         documents=[doc_text],  # List of documents
#         metadatas=[{"id": document_id}],  # Metadata: you can store additional information like document IDs
#         embeddings=embeddings,  # The generated embeddings
#         ids=[document_id],  # ID for each document
#     )

# vector_db/db_handler.py

CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))

PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

def query_vector_db(query_text: str):
    # Set up ChromaDB with embedding
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Similarity search
    results = db.similarity_search_with_score(query_text, k=5)
    print("🧪 Test query:", query_text)
    print("🧠 Embedding function:", embedding_function)
    print("🔎 Raw Chroma results:", results)

    if not results:
        print("⚠️ No results found in ChromaDB for the query.")
        return {
            "answer": "No relevant information found in the database.",
            "sources": []
        }
    # Prepare context
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _ in results])

    # Format prompt
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    # Generate answer using Gemini
    model = GoogleGenerativeAI(model="models/gemini-2.0-flash")
    response_text = model.invoke(prompt)

    print("==== Prompt to Gemini ====")
    print(prompt)

    # Extract source IDs
    sources = [doc.metadata.get("id", "Unknown") for doc, _ in results]

    # Return both response and sources for frontend
    return {
        "answer": response_text,
        "sources": sources
    }
