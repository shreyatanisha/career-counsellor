from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.intake import IntakeStartResponse, IntakeRespondRequest, IntakeRespondResponse
from app.services.ai_service import run_intake_turn
from app.models.profile import UserProfile
import uuid
import json

router = APIRouter()

# Temporary in-memory session store since we replaced the MongoDB sessions collection
# In a real app, this should be in Redis or a dedicated SQL table.
intake_sessions = {}


@router.post("/start", response_model=IntakeStartResponse)
async def start_intake():
    """Start a new intake session and return the first question."""
    session_id = str(uuid.uuid4())

    try:
        history = []
        result = await run_intake_turn(history, "Hello, I want career guidance.")

        intake_sessions[session_id] = {
            "history": result["history"],
            "question_count": 1,
        }

        return IntakeStartResponse(
            session_id=session_id,
            message=result["message"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start intake: {str(e)}")


@router.post("/respond", response_model=IntakeRespondResponse)
async def respond_to_intake(request: IntakeRespondRequest, db: Session = Depends(get_db)):
    """Process user response and return next question or completed profile."""
    session_data = intake_sessions.get(request.session_id, {"history": []})
    history = request.history if request.history else session_data["history"]

    try:
        result = await run_intake_turn(history, request.message)

        intake_sessions[request.session_id] = {
            "history": result["history"],
            "question_count": session_data.get("question_count", 0) + 1,
        }

        if result["is_complete"]:
            uid = request.user_id if request.user_id else request.session_id
            # Save profile to SQL
            p_data = result["profile"]
            profile = db.query(UserProfile).filter(UserProfile.user_id == uid).first()
            if not profile:
                profile = UserProfile(user_id=uid)
                db.add(profile)
            
            profile.education = p_data.get("education")
            profile.skills = p_data.get("skills", [])
            profile.interests = p_data.get("interests", [])
            profile.personality = p_data.get("personality")
            profile.constraints = p_data.get("constraints", {})
            profile.frustration = p_data.get("frustration")
            profile.readiness_score = p_data.get("readiness_score", 0)
            profile.intake_completed = True
            
            db.commit()
            
            # Inject profile_id so the frontend can properly correlate matching requests
            result["profile"]["profile_id"] = uid

        return IntakeRespondResponse(
            message=result["message"],
            is_complete=result["is_complete"],
            profile=result["profile"],
            history=result["history"]
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Intake error: {str(e)}")


@router.get("/status/{user_id}")
async def get_intake_status(user_id: str, db: Session = Depends(get_db)):
    """Return intake completion status for a user."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    return {
        "user_id": user_id,
        "intake_completed": profile.intake_completed if profile else False,
    }
