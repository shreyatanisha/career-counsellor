from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import intake, careers, roadmap, gap_analysis, feedback, users
from app.core.database import engine, Base
import app.models  # Ensures models are imported before create_all

# Create MySQL tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Career Counsellor API (MySQL)",
    description="AI-powered career counselling with intake, matching, roadmaps, and gap analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(intake.router, prefix="/api/intake", tags=["intake"])
app.include_router(careers.router, prefix="/api/careers", tags=["careers"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(gap_analysis.router, prefix="/api/gaps", tags=["gaps"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0", "database": "mysql"}

# --- Serve React Frontend ---
import os
import sys
from fastapi.responses import FileResponse

# Check if we're running as a PyInstaller bundle
if getattr(sys, 'frozen', False):
    # If bundled, the frontend/dist is inside the MEIPASS temp folder
    base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    dist_dir = os.path.join(base_dir, "frontend", "dist")
else:
    # If running locally, it's two levels up from main.py and into frontend/dist
    dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")

@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    # If the user is trying to reach an API endpoint that doesn't exist, don't serve index.html
    if catchall.startswith("api/"):
        return {"detail": "Path not found"}
        
    file_path = os.path.join(dist_dir, catchall)
    # Check if the requested file exists (like /assets/main.js)
    if catchall and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Fallback: serve index.html for React router
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"detail": "Frontend build not found at " + dist_dir}
