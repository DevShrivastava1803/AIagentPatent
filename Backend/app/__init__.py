from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv # Added
import os # Added

# Load environment variables from .env file
load_dotenv()

# Now it's safe to import modules that might use os.environ.get("GOOGLE_API_KEY")
# For example, if services are initialized at import time.
# However, get_embedding_function and analysis_service already try to get the key.
# It's good practice to load .env as early as possible.

from .routes import routes  # Import the routes from routes.py

app = Flask(__name__)
CORS(app, origins=["http://localhost:8080", "http://localhost:5173", "http://192.168.10.35:8081", "http://localhost:8081"])  # Allow requests from your Vite app

# Register the blueprint for routes
app.register_blueprint(routes)

# Example of how to access the API key if needed directly in app factory
# print(f"Loaded GOOGLE_API_KEY: {os.environ.get('GOOGLE_API_KEY')}")


if __name__ == "__main__":
    # Check for GOOGLE_API_KEY but don't exit if missing
    if not os.environ.get("GOOGLE_API_KEY"):
        print("⚠️  WARNING: GOOGLE_API_KEY not found in environment. AI features will be limited.")
        print("Create a .env file in the Backend directory with: GOOGLE_API_KEY=your_api_key_here")
    else:
        print("✅ GOOGLE_API_KEY found in environment")
    
    app.run(debug=True, host="0.0.0.0", port=5000)
