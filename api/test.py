from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def test():
    return jsonify({
        'message': 'Test endpoint working!',
        'openai_key_set': bool(os.getenv('OPENAI_API_KEY')),
        'cwd': os.getcwd(),
        'env_vars': list(os.environ.keys())
    })

# Export the app for Vercel
app = app
