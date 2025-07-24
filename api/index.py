import sys
import os

# Add the parent directory to the path so we can import sva
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from sva import app
    print("Successfully imported Flask app from sva.py")
except Exception as e:
    print(f"Error importing Flask app: {e}")
    # Create a minimal Flask app as fallback
    from flask import Flask, jsonify
    app = Flask(__name__)

    @app.route('/')
    def error():
        return jsonify({
            'error': 'Failed to import main application',
            'message': str(e)
        }), 500

# Export the Flask app directly for Vercel
# Vercel will handle the WSGI interface automatically
