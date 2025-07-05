# routes.py

import os
import traceback
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

        print(f"📊 Starting analysis for: {document_id}")
        # Pass document_id to analyze_patent service function
        analysis_result_dict = analyze_patent(document_id)

        if not analysis_result_dict:
            return jsonify({"error": f"Analysis not found or failed for document ID: {document_id}"}), 404

        print("✅ Analysis completed successfully")
        return jsonify(analysis_result_dict)

    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return jsonify({"error": f"Internal server error during analysis: {str(e)}"}), 500


@routes.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'GET':
        # Handle GET request (frontend navigation)
        return jsonify({"message": "Upload endpoint ready"}), 200
    
    # Handle POST request (file upload)
    file = request.files.get("file")
    
    if not file or not file.filename: # Ensure filename exists
        return jsonify({"error": "No file or filename provided."}), 400

    # Create uploads directory if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        print(f"📤 Processing upload: {file.filename}")
        # Call the processing logic and get the document_id (filename)
        document_id = process_pdf_to_chroma(file_path)
        print(f"✅ Upload complete: {document_id}")
        return jsonify({
            "message": "PDF uploaded and processed successfully.",
            "document_id": document_id
        })
    except FileNotFoundError as e:
        print(f"❌ File not found: {e}")
        return jsonify({"error": f"File processing error: {str(e)}"}), 400
    except Exception as e:
        print(f"❌ Processing error: {e}")
        return jsonify({"error": "Server error during file processing."}), 500

@routes.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    question = data.get("question")
    document_id = data.get("document_id")  # Get document context if provided

    if not question:
        return jsonify({"error": "No question provided."}), 400

    try:
        print(f"💬 Query: {question[:50]}{'...' if len(question) > 50 else ''}")
        # Query the vector database with document context if available
        result = query_vector_db(question, document_id)
        
        if not result or not result.get('answer'):
            return jsonify({"answer": "I couldn't find any relevant information in the documents.", "sources": []})

        print("✅ Query completed successfully")
        return jsonify({
            "answer": result['answer'], 
            "sources": result.get('sources', [])
        })

    except Exception as e:
        print(f"❌ Query error: {e}")
        return jsonify({"error": f"An error occurred while processing your question: {str(e)}"}), 500


