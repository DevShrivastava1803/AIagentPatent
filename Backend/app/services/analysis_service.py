import google.generativeai as genai
from typing import List, Dict, Optional
# Removed: from chromadb.utils import embedding_functions
from app.services.vector_db.chroma_connector import ChromaConnector
from app.services.get_embedding_function import get_embedding_function # Added

import os # Added
# Initialize Chroma connector
chroma_connector = ChromaConnector()

# --- Configure Gemini ---
# API Key will be handled by environment variables
gemini_api_key = os.environ.get("GOOGLE_API_KEY")
if not gemini_api_key:
    # This service might be initialized at module import time.
    # Consider deferring GenerativeModel instantiation or logging a warning if key is missing.
    # For now, let's assume key will be present when functions are called,
    # or rely on get_embedding_function's check to happen first if it's called earlier.
    print("Warning: GOOGLE_API_KEY not set. GenerativeModel might fail.")
    # Or raise ValueError("GOOGLE_API_KEY environment variable not set, required for GenerativeModel.")
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-pro")


# --- Embedding Function ---
# Unified embedding function
embedding_fn = get_embedding_function() # Changed

# --- Analysis Logic ---

def generate_summary(text: str) -> str:
    """Generate a summary of the patent text."""
    prompt = f"Summarize the following patent proposal in 3-5 sentences:\n{text[:5000]}"
    response = model.generate_content(prompt)
    return response.text.strip()

def score_novelty(text: str) -> int:
    """Score the novelty of the patent on a scale of 0-100."""
    prompt = ("Rate the novelty of this patent on a scale of 0 to 100. "
             "Consider technical innovation and prior art. "
             "Return only the number:\n{text[:3000]}")
    response = model.generate_content(prompt)
    try:
        return min(100, max(0, int("".join(filter(str.isdigit, response.text.strip())))))
    except ValueError:
        return 60  # Fallback score

def find_issues(text: str) -> List[str]:
    """Identify potential issues with the patent."""
    prompt = ("List 3-5 potential legal, technical, or novelty issues with this patent. "
             "Use concise bullet points:\n{text[:4000]}")
    response = model.generate_content(prompt)
    return [line.strip("•- ").strip() for line in response.text.strip().split("\n") if line.strip()]

def suggest_improvements(text: str) -> List[str]:
    """Suggest patent improvements."""
    prompt = ("Suggest 3-5 specific improvements to strengthen this patent:"
             "\n{text[:4000]}")
    response = model.generate_content(prompt)
    return [line.strip("•- ").strip() for line in response.text.strip().split("\n") if line.strip()]

def find_similar_patents(text: str, top_k: int = 5) -> List[Dict]:
    """Find similar patents in the database."""
    # Use the embed_documents method from LangChain's GoogleGenerativeAIEmbeddings
    # It expects a list of texts and returns a list of embeddings.
    query_embedding = embedding_fn.embed_documents([text])
    
    results = chroma_connector.collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    similar = []
    for doc, meta, distance in zip(results["documents"][0], results["metadatas"][0], results["distances"][0]):
        similarity = max(0, 100 - distance * 100)  # Convert distance to similarity percentage
        similar.append({
            "id": meta.get("id", "N/A"),
            "title": meta.get("title", "Untitled"),
            "similarity": round(similarity, 2),
            "date": meta.get("date", "Unknown"),
            "assignee": meta.get("assignee", "N/A"),
            "excerpt": doc[:200] + "..." if len(doc) > 200 else doc
        })
    return similar

def analyze_patent(document_id: str) -> Optional[Dict]:
    """
    Analyze a specific patent document identified by document_id (filename_base).
    Fetches all chunks for this document, reconstructs its text, and performs analysis.
    """
    try:
        # Query ChromaDB for all chunks matching the document_id (filename_base)
        # Ensure your ChromaConnector's collection is the one populated by process.py (e.g., "langchain" or "patent_data")
        # If ChromaConnector uses a collection name like "langchain" (default for some Langchain Chroma usage)
        # and vector_store.py uses "patent_data", that's another inconsistency to fix.
        # For now, assume chroma_connector.collection is the correct one.

        # The 'where' filter in ChromaDB needs to match metadata fields.
        # We added 'filename_base' to metadata in process.py
        results = chroma_connector.collection.get(
            where={"filename_base": document_id},
            include=["documents", "metadatas"] # Get documents and their metadata
        )

        if not results or not results['documents']:
            print(f"No document chunks found for document_id: {document_id}")
            return None

        # Sort documents by original page and chunk id if possible, though simple concatenation is often sufficient.
        # The chunk_id was "source_full_path:page:chunk_index".
        # For simplicity here, we'll just join them. If order is critical, more sophisticated sorting of chunks is needed.
        # We assume 'documents' is a list of text strings.
        full_text = "\n\n".join(results['documents'])

        # Use metadata from the first chunk as representative, or aggregate if needed.
        # For analysis, the primary input is the full_text. Metadata for the response can be tricky.
        # Let's assume the 'title' for the analysis output can be the document_id itself,
        # or if there's a title field in metadata from PDF extraction, that could be used.
        # For now, using document_id as title.

        # Use metadata from the first chunk for date/applicant if available, or defaults.
        # This might not be perfectly accurate if metadata varies across chunks from different original docs
        # that coincidentally had the same basename (unlikely for uploads, but possible).
        first_chunk_metadata = results['metadatas'][0] if results['metadatas'] else {}

        return {
            "title": first_chunk_metadata.get("title_pdf", document_id), # Assuming PyPDFLoader might add 'title' from PDF properties
                                                                      # or fallback to filename (document_id)
            "date": first_chunk_metadata.get("creation_date_pdf", "Unknown Date"), # Example, depends on actual metadata keys
            "applicant": first_chunk_metadata.get("author_pdf", "Unknown Applicant"), # Example
            "summary": generate_summary(full_text),
            "noveltyScore": score_novelty(full_text),
            "potentialIssues": find_issues(full_text),
            "recommendations": suggest_improvements(full_text),
            "similarPatents": find_similar_patents(full_text), # find_similar_patents uses the full text
        }
    except Exception as e:
        print(f"Error analyzing document {document_id}: {e}")
        # import traceback; traceback.print_exc() # For detailed debugging
        return None

    # except Exception as e:
    #     print(f"Error analyzing document: {e}")
    #     return None