# routes.py

import os
from flask import Blueprint, request, jsonify
from app.services.process import process_pdf_to_chroma  # Now using this function directly
from app.services.vector_db.db_handler import query_vector_db
from app.services.get_embedding_function import get_embedding_function
from app.services.analysis_service import analyze_patent

routes = Blueprint('routes', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")  # Ensure uploads folder exists



analyze_bp = Blueprint("analyze", __name__)

@analyze_bp.route("/analyze", methods=["GET"])
def analyze():
    try:
        # You might later want to pass a document ID or file name here
        result = analyze_patent()

        return jsonify({
            "patent": result["patent"],
            "similarPatents": result["similarPatents"]
        })

    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@routes.route('/upload', methods=['POST'])
def upload():
    file = request.files.get("file")
    
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # Create uploads directory if it doesn't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Call the processing logic
    process_pdf_to_chroma(file_path)
    
    return jsonify({"message": "PDF uploaded and processed", "summary": "Vector DB updated."})

@routes.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    question = data.get("question")

    if question:
        # Query the vector database for the most relevant results
        results = query_vector_db(question)
        return jsonify({"results": results})

    return jsonify({"message": "No question provided."})


