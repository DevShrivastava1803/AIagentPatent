# routes.py

import os
from flask import Blueprint, request, jsonify
from app.services.process import process_pdf_to_chroma
from app.services.vector_db.db_handler import query_vector_db
from app.services.analysis_service import analyze_patent, model as analysis_model # Import the Gemini model
# from app.services.get_embedding_function import get_embedding_function # Not directly used in routes 

routes = Blueprint('routes', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

# analyze_bp = Blueprint("analyze", __name__) # Removed, will put /analyze on main 'routes'

@routes.route("/analyze/<document_id>", methods=["GET"]) # Changed route and added document_id
def analyze(document_id: str): # Added document_id parameter
    try:
        if not document_id:
            return jsonify({"error": "Document ID is required."}), 400

        # Pass document_id to analyze_patent service function
        analysis_result_dict = analyze_patent(document_id)

        if not analysis_result_dict:
            return jsonify({"error": f"Analysis not found or failed for document ID: {document_id}"}), 404

        # The analyze_patent function is expected to return a dict with "patent" and "similarPatents" keys
        # if successful, or None if not. The frontend expects this structure.
        return jsonify(analysis_result_dict)

    except Exception as e:
        print(f"Analysis error for document {document_id}: {e}")
        # Log traceback e.g. import traceback; traceback.print_exc()
        return jsonify({"error": "Internal server error during analysis."}), 500


@routes.route('/upload', methods=['POST'])
def upload():
    file = request.files.get("file")
    
    if not file or not file.filename: # Ensure filename exists
        return jsonify({"error": "No file or filename provided."}), 400

    # Create uploads directory if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        # Call the processing logic and get the document_id (filename)
        document_id = process_pdf_to_chroma(file_path)
        return jsonify({
            "message": "PDF uploaded and processed successfully.",
            "document_id": document_id
        })
    except FileNotFoundError as e:
        print(f"Upload processing error - File not found: {e}")
        return jsonify({"error": f"File processing error: {str(e)}"}), 400
    except Exception as e:
        print(f"Upload processing error: {e}")
        # Log traceback
        return jsonify({"error": "Server error during file processing."}), 500

@routes.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    question = data.get("question")

    if not question:
        return jsonify({"error": "No question provided."}), 400

    try:
        # 1. Query the vector database for relevant document chunks
        # Assuming query_vector_db returns a list of dicts with 'page_content' and 'metadata'
        # And metadata might contain 'id', 'title', or 'source_file'
        retrieved_chunks = query_vector_db(question, top_k=3) # Get top 3 chunks

        if not retrieved_chunks:
            return jsonify({"answer": "I couldn't find any relevant information in the documents.", "sources": []})

        # 2. Prepare context for the LLM
        context_parts = []
        sources = set() # Use a set to avoid duplicate source identifiers
        for i, chunk in enumerate(retrieved_chunks):
            context_parts.append(f"Context Chunk {i+1}:\n{chunk.get('page_content', '')}")
            # Try to get a source identifier from metadata
            source_id = chunk.get('metadata', {}).get('title') or \
                        chunk.get('metadata', {}).get('id') or \
                        chunk.get('metadata', {}).get('source_file') or \
                        f"Chunk {i+1}"
            sources.add(str(source_id))

        context_str = "\n\n".join(context_parts)

        # 3. Construct prompt for LLM
        prompt = f"""Based on the following context, please answer the question.
Context:
{context_str}

Question: {question}

Answer:"""

        # 4. Generate answer using the LLM
        # analysis_model is the gemini-pro model from analysis_service
        response = analysis_model.generate_content(prompt)
        answer = response.text.strip()

        return jsonify({"answer": answer, "sources": sorted(list(sources))})

    except Exception as e:
        print(f"Error in /query endpoint: {e}")
        # Consider logging the full traceback here
        return jsonify({"error": "An error occurred while processing your question."}), 500


