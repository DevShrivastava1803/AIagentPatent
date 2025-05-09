import google.generativeai as genai
from typing import List, Dict, Optional
from chromadb.utils import embedding_functions
from app.services.vector_db.chroma_connector import ChromaConnector

# Initialize Chroma connector
chroma_connector = ChromaConnector()

# --- Configure Gemini ---
genai.configure(api_key="AIzaSyDLnLfQIfe_1KElpgR2a9kNAUuXNSSFePg")  # Replace with your actual API key
model = genai.GenerativeModel("gemini-pro")

# --- Embedding Function ---
# Updated to use correct parameter name (typically 'model_name' instead of 'model')
embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
    api_key="AIzaSyDLnLfQIfe_1KElpgR2a9kNAUuXNSSFePg",  # Replace with your actual API key
    model_name="models/embedding-001"  # Changed from 'model' to 'model_name'
)

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
    query_embedding = embedding_fn([text])  # Note: embedding functions typically expect a list
    
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

def analyze_patent() -> Optional[Dict]:
    """Analyze the most recent patent document in the database."""
    try:
        result = chroma_connector.collection.peek(limit=1)
        if not result or not result['documents']:
            return None

        text = result['documents'][0]
        metadata = result['metadatas'][0] if result['metadatas'] else {}

        return {
            "title": metadata.get("title", "Untitled Proposal"),
            "date": metadata.get("date", "Unknown Date"),
            "applicant": metadata.get("applicant", "Unknown Applicant"),
            "summary": generate_summary(text),
            "noveltyScore": score_novelty(text),
            "potentialIssues": find_issues(text),
            "recommendations": suggest_improvements(text),
            "similarPatents": find_similar_patents(text),
        }
    except Exception as e:
        print(f"Error analyzing document: {e}")
        return None