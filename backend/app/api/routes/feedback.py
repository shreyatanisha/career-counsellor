from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.roadmap import FeedbackCheckInRequest
from app.services.ai_service import run_feedback
from app.models.roadmap import Roadmap
from app.models.feedback import FeedbackCheckIn

router = APIRouter()


@router.post("/checkin")
async def submit_checkin(request: FeedbackCheckInRequest, db: Session = Depends(get_db)):
    """Submit a progress check-in and get AI feedback."""
    try:
        roadmap = db.query(Roadmap).filter(Roadmap.id == request.roadmap_id).first()

        roadmap_data = {}
        if roadmap:
            roadmap_data = {
                "target_role": roadmap.target_role,
                "milestones": roadmap.milestones,
                "current_phase": roadmap.current_phase,
                "weekly_commitment_hours": roadmap.weekly_commitment_hours,
            }

        result = await run_feedback(
            roadmap_data,
            request.completed_actions,
            request.mood_score,
            request.blockers
        )

        total_actions = sum(
            len(m.get("actions", []))
            for m in roadmap_data.get("milestones", [])
        )
        completion_rate = (
            len(request.completed_actions) / total_actions * 100
            if total_actions > 0 else 0.0
        )

        checkin = FeedbackCheckIn(
            roadmap_id=request.roadmap_id,
            completion_rate=completion_rate,
            mood_score=request.mood_score,
            completed_actions=request.completed_actions,
            blockers=request.blockers,
            mode=result.get("mode", "NUDGE"),
            ai_response=result,
        )
        db.add(checkin)
        db.commit()

        return result

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Check-in failed: {str(e)}")


@router.get("/{roadmap_id}/history")
async def get_checkin_history(roadmap_id: str, db: Session = Depends(get_db)):
    """Return all check-in history for a roadmap."""
    try:
        checkins = db.query(FeedbackCheckIn).filter(
            FeedbackCheckIn.roadmap_id == roadmap_id
        ).order_by(FeedbackCheckIn.check_in_date.desc()).all()

        return [
            {
                "id": c.id,
                "check_in_date": str(c.check_in_date),
                "completion_rate": c.completion_rate,
                "mood_score": c.mood_score,
                "completed_actions": c.completed_actions,
                "blockers": c.blockers,
                "mode": c.mode,
                "ai_response": c.ai_response,
            }
            for c in checkins
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")
