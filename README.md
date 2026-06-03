# AI Career Counsellor

AI-powered career counselling web application with intake assessment, career matching, personalised roadmaps, and skill gap analysis.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v3
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (via Motor async driver)
- **AI**: Anthropic Claude API
- **Auth**: Firebase Authentication
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Anthropic API key
- Firebase project (optional — demo mode available)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
```

Edit `.env` with your credentials:
```
ANTHROPIC_API_KEY=your_key
MONGODB_URL=mongodb://localhost:27017
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Demo Mode

Click **"Try Demo Mode"** on the login modal to use the app without Firebase credentials. Demo mode creates a local user and bypasses authentication.

## Features

- 🧠 AI-powered 6-question career intake assessment
- 🎯 3 ranked career matches with fit scores
- 🗺️ 4-phase personalised roadmaps with resources
- 📊 Skill gap analysis with learning recommendations
- 📈 Progress dashboard with weekly check-ins
- 🤖 Adaptive AI coaching (REPLAN / NUDGE / ACCELERATE)
- 👑 Admin panel with user management
