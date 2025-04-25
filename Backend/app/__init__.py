from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow requests from your Vite app (localhost:5173)
