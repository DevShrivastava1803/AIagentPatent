from flask import Blueprint, request, jsonify

routes = Blueprint('routes', __name__)

@routes.route('/upload', methods=['POST'])
def upload():
    file = request.files.get("file")
    # Your processing logic here (use LangChain)
    return jsonify({"message": "PDF uploaded", "summary": "..."})

@routes.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    question = data.get("question")
    # RAG + response generation
    return jsonify({"answer": "Here is your AI response"})
