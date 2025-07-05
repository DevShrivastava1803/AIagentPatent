from google.generativeai.generative_models import GenerativeModel
from google.generativeai.client import configure
from typing import List, Dict, Optional
from app.services.vector_db.chroma_connector import ChromaConnector
from app.services.get_embedding_function import get_embedding_function
import os

# Initialize Chroma connector
chroma_connector = ChromaConnector()

# --- Configure Gemini ---
gemini_api_key = os.environ.get("GOOGLE_API_KEY")
if not gemini_api_key:
    print("Warning: GOOGLE_API_KEY not set. Some features may not work.")
    model = None
else:
    configure(api_key=gemini_api_key)
    model = GenerativeModel('gemini-2.5-flash')


# --- Embedding Function ---
# Unified embedding function
embedding_fn = get_embedding_function() # Changed

# --- Analysis Logic ---

def generate_summary(text: str) -> str:
    """Generate a summary of the patent text."""
    if not model:
        return "Summary generation requires Google API key to be configured."
    prompt = f"Summarize the following patent proposal in 3-5 sentences:\n{text[:5000]}"
    response = model.generate_content(prompt)
    return response.text.strip()

def score_novelty(text: str) -> int:
    """Score the novelty of the patent on a scale of 0-100."""
    if not model:
        return 60  # Fallback score
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
    if not model:
        return ["API key not configured for detailed analysis"]
    prompt = ("List 3-5 potential legal, technical, or novelty issues with this patent. "
             "Use concise bullet points:\n{text[:4000]}")
    response = model.generate_content(prompt)
    return [line.strip("•- ").strip() for line in response.text.strip().split("\n") if line.strip()]

def suggest_improvements(text: str) -> List[str]:
    """Suggest patent improvements."""
    if not model:
        return ["API key not configured for detailed analysis"]
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
        query_embeddings=query_embedding[0],  # Get the first (and only) embedding
        n_results=top_k
    )

    similar = []
    if results and results.get("documents") and results.get("metadatas") and results.get("distances"):
        documents = results["documents"][0]  # type: ignore
        metadatas = results["metadatas"][0]  # type: ignore
        distances = results["distances"][0]  # type: ignore
        for doc, meta, distance in zip(documents, metadatas, distances):
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
        # URL decode the document_id to handle special characters
        import urllib.parse
        decoded_document_id = urllib.parse.unquote(document_id)
        print(f"📄 Analyzing document: {decoded_document_id}")
        
        # Query ChromaDB for all chunks matching the document_id (filename_base)
        results = chroma_connector.collection.get(
            where={"filename_base": decoded_document_id}
        )

        if not results or not results['documents']:
            print(f"❌ Document not found: {decoded_document_id}")
            return None
        
        print(f"✅ Found {len(results['documents'])} document chunks")

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
        first_chunk_metadata = results['metadatas'][0] if results['metadatas'] else {}

        print("🤖 Generating analysis...")
        
        return {
            "title": first_chunk_metadata.get("title_pdf", document_id),
            "date": first_chunk_metadata.get("creation_date_pdf", "Unknown Date"),
            "applicant": first_chunk_metadata.get("author_pdf", "Unknown Applicant"),
            "summary": generate_summary(full_text),
            "noveltyScore": score_novelty(full_text),
            "potentialIssues": find_issues(full_text),
            "recommendations": suggest_improvements(full_text),
            "similarPatents": find_similar_patents(full_text),
        }
    except Exception as e:
        print(f"Error analyzing document {document_id}: {e}")
        # import traceback; traceback.print_exc() # For detailed debugging
        return None

    # except Exception as e:
    #     print(f"Error analyzing document: {e}")
    #     return None