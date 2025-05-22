# HistoryAlive

## Interactive Conversations with Historical Figures for Education

![HistoryAlive Banner](frontend/public/images/lincoln.jpg)

## Project Overview

HistoryAlive is an educational platform that allows students to engage in interactive conversations with historical figures. By leveraging Sensay's Wisdom Engine API, the application creates lifelike replicas of important historical personalities, enabling students to learn history through direct dialogue and engagement.

## Live Demo

Access the live demo at: [https://rp9hwiqcxqp0.manus.space](https://rp9hwiqcxqp0.manus.space)

## Features

- **Interactive Historical Conversations**: Engage with Abraham Lincoln, Marie Curie, William Shakespeare, and Harriet Tubman
- **Educational Context**: Each figure includes a timeline of key life events and historical context
- **Personalized Learning**: Interest-based recommendations and suggested questions
- **Note-Taking System**: Save insights from conversations for later reference
- **Responsive Design**: Works seamlessly on all devices

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Flask (Python)
- **API Integration**: Sensay Wisdom Engine API
- **Styling**: Custom CSS with animations

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Sensay API Key

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set your Sensay API key:
   ```
   # In src/main.py, replace the API key with your own
   SENSAY_API_KEY = "your_api_key_here"
   ```

5. Start the Flask server:
   ```
   python src/main.py
   ```

## Project Structure

```
historyalive/
├── frontend/
│   ├── src/               # React source code
│   │   ├── App.tsx        # Main application component
│   │   ├── api.ts         # API integration
│   │   └── App.css        # Styling
│   └── public/            # Static assets
│       └── images/        # Historical figure images
├── backend/
│   ├── src/
│   │   └── main.py        # Flask application
│   └── requirements.txt   # Python dependencies
└── README.md              # This file
```

## Usage Guide

1. Start both the frontend and backend servers as described in the setup instructions.
2. Open your browser and navigate to the frontend URL (typically http://localhost:3000).
3. Select your interests to get personalized historical figure recommendations.
4. Choose a historical figure to start a conversation.
5. Ask questions and receive historically accurate responses.
6. Use the note-taking feature to record insights from your conversation.

## API Integration

HistoryAlive uses the Sensay Wisdom Engine API to create and interact with historical figure replicas. The backend serves as a proxy to handle authentication and CORS issues, while the frontend provides the user interface for conversations.

Key API endpoints:
- `/api/replicas` - Creates new historical figure replicas
- `/api/chat/completions` - Handles conversation with historical figures

## Educational Use Case

HistoryAlive transforms history education by:

1. **Increasing Engagement**: Students are more engaged when they can directly interact with historical figures.
2. **Personalizing Learning**: Different interests lead to different historical figure recommendations.
3. **Deepening Understanding**: Conversations provide context and nuance beyond textbook facts.
4. **Developing Critical Thinking**: Students formulate their own questions and analyze responses.
5. **Improving Retention**: Interactive learning experiences lead to better information retention.

## License

This project is created for the Sensay EdTech Breakthrough Hackathon and is not licensed for commercial use.

## Acknowledgments

- Sensay for providing the Wisdom Engine API
- Historical images are AI-generated for educational purposes
