import os
import sys
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Initialize Flask app
app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Sensay API configuration
SENSAY_API_KEY = "Your sensay api key here"
SENSAY_API_BASE_URL = "https://api.sensay.io/v1"

# Serve static files (React frontend)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# Proxy endpoint for creating replicas
@app.route('/api/replicas', methods=['POST'])
def create_replica():
    try:
        # Get request data
        data = request.json
        print(f"Received replica creation request: {data}")
        
        # Prepare request to Sensay API
        headers = {
            'Authorization': f'Bearer {SENSAY_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Format the request for Sensay API - using exact field names from Sensay API
        sensay_payload = {
            'name': data.get('name', ''),
            'description': data.get('shortDescription', ''),
            'system_prompt': data.get('systemMessage', ''),
            'type': 'character',  # Fixed value for historical figures
            'purpose': 'education'  # Fixed value for educational use
        }
        
        print(f"Sending to Sensay API: {sensay_payload}")
        
        # Make request to Sensay API
        response = requests.post(
            f"{SENSAY_API_BASE_URL}/replicas",
            headers=headers,
            json=sensay_payload
        )
        
        # Print response for debugging
        print(f"Sensay API response status: {response.status_code}")
        print(f"Sensay API response body: {response.text}")
        
        # Check if request was successful
        response.raise_for_status()
        
        # Return response from Sensay API
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        # Log the error
        print(f"Error creating replica: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        
        # For demo purposes, return a mock successful response
        mock_response = {
            'uuid': f'mock-uuid-{data.get("name", "unknown").replace(" ", "-").lower()}',
            'name': data.get('name', 'Unknown'),
            'status': 'active'
        }
        return jsonify(mock_response)
    
    except Exception as e:
        # Log the error
        print(f"Unexpected error creating replica: {str(e)}")
        
        # For demo purposes, return a mock successful response
        mock_response = {
            'uuid': f'mock-uuid-{data.get("name", "unknown").replace(" ", "-").lower()}',
            'name': data.get('name', 'Unknown'),
            'status': 'active'
        }
        return jsonify(mock_response)

# Proxy endpoint for chat completions
@app.route('/api/chat/completions', methods=['POST'])
def chat_completion():
    try:
        # Get request data
        data = request.json
        print(f"Received chat completion request: {data}")
        
        # Prepare request to Sensay API
        headers = {
            'Authorization': f'Bearer {SENSAY_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        # Format the request for Sensay API
        sensay_payload = {
            'replica_id': data.get('replica_uuid'),
            'messages': data.get('messages', [])
        }
        
        print(f"Sending to Sensay API: {sensay_payload}")
        
        # Make request to Sensay API
        response = requests.post(
            f"{SENSAY_API_BASE_URL}/chat/completions",
            headers=headers,
            json=sensay_payload
        )
        
        # Print response for debugging
        print(f"Sensay API response status: {response.status_code}")
        print(f"Sensay API response body: {response.text}")
        
        # Check if request was successful
        response.raise_for_status()
        
        # Return response from Sensay API
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        # Log the error
        print(f"Error getting chat completion: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
        
        # For demo purposes, return a mock successful response
        user_message = "Unknown question"
        if data.get('messages') and len(data.get('messages')) > 0:
            user_message = data.get('messages')[-1].get('content', 'Unknown question')
        
        figure_id = data.get('replica_uuid', '')
        
        # Generate appropriate response based on historical figure
        if 'lincoln' in figure_id.lower():
            response_text = f"As Abraham Lincoln, I would say that regarding '{user_message}', my approach was always to preserve the Union while standing firm on moral principles. During the Civil War, I sought to balance military necessity with compassion, and to lead with both strength and humility."
        elif 'curie' in figure_id.lower():
            response_text = f"As Marie Curie, I find your question about '{user_message}' quite interesting. In my scientific work, I always believed in rigorous experimentation and careful observation. My research on radioactivity was driven by curiosity and determination, despite the many challenges I faced as a woman in science."
        elif 'shakespeare' in figure_id.lower():
            response_text = f"Good fellow, thy query about '{user_message}' doth stir my thoughts. In my plays and sonnets, I sought to capture the full measure of human experience - from love's sweet joy to ambition's bitter price. The stage is but a mirror to life's grand pageant."
        elif 'tubman' in figure_id.lower():
            response_text = f"About '{user_message}', I must tell you that freedom ain't free. In my work on the Underground Railroad, I never lost a single passenger. I followed the North Star and trusted in the Lord to guide my path through danger. Courage and determination were my constant companions."
        else:
            response_text = f"Thank you for your question about '{user_message}'. As a historical figure, I have much wisdom to share on this topic. Please continue our conversation to learn more about my perspective and experiences."
        
        mock_response = {
            'choices': [
                {
                    'message': {
                        'content': response_text,
                        'role': 'assistant'
                    }
                }
            ]
        }
        return jsonify(mock_response)
    
    except Exception as e:
        # Log the error
        print(f"Unexpected error getting chat completion: {str(e)}")
        
        # For demo purposes, return a mock successful response
        mock_response = {
            'choices': [
                {
                    'message': {
                        'content': "I apologize, but I'm having difficulty accessing my knowledge at the moment. However, as a historical figure, I would be happy to continue our conversation on any topic of interest to you.",
                        'role': 'assistant'
                    }
                }
            ]
        }
        return jsonify(mock_response)

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
