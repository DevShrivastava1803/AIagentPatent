from flask import Flask
from flask_cors import CORS
from .routes import routes  # Import the routes from routes.py

app = Flask(__name__)
CORS(app)  # Allow requests from your Vite app (localhost:5173)

# Register the blueprint for routes
app.register_blueprint(routes)

if __name__ == "__main__":
    app.run(debug=True)
