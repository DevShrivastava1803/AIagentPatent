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
CORS(app)  # Allow requests from your Vite app (localhost:5173 or other configured frontend port)

# Register the blueprint for routes
app.register_blueprint(routes)

# Example of how to access the API key if needed directly in app factory
# print(f"Loaded GOOGLE_API_KEY: {os.environ.get('GOOGLE_API_KEY')}")


if __name__ == "__main__":
    # Ensure GOOGLE_API_KEY is loaded before running
    if not os.environ.get("GOOGLE_API_KEY"):
        print("ERROR: GOOGLE_API_KEY not found in environment. Please set it in .env file.")
    else:
        app.run(debug=True)
