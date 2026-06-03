from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.roadmap import RoadmapGenerateRequest, RoadmapProgressUpdate
from app.services.ai_service import generate_roadmap
from app.models.roadmap import Roadmap
from app.models.profile import UserProfile
from app.models.career_match import CareerMatch

router = APIRouter()


@router.post("/generate")
async def generate_roadmap_endpoint(request: RoadmapGenerateRequest, db: Session = Depends(get_db)):
    """Generate a personalised career roadmap using AI."""
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == request.profile_id).first()
        career = db.query(CareerMatch).filter(CareerMatch.id == request.career_match_id).first()

        profile_data = {
            "education": profile.education if profile else "",
            "skills": profile.skills if profile else [],
            "interests": profile.interests if profile else [],
        }

        career_data = {
            "role": career.role if career else "",
            "required_skills": career.required_skills if career else [],
            "user_has": career.user_has if career else [],
            "user_lacks": career.user_lacks if career else [],
        }

        roadmap_data = await generate_roadmap(profile_data, career_data)

        roadmap = Roadmap(
            career_match_id=request.career_match_id,
            target_role=roadmap_data.get("target_role", ""),
            total_duration=roadmap_data.get("total_duration", ""),
            milestones=roadmap_data.get("milestones", []),
            weekly_commitment_hours=roadmap_data.get("weekly_commitment_hours", 0),
            quick_win=roadmap_data.get("quick_win", ""),
            biggest_risk=roadmap_data.get("biggest_risk", ""),
            current_phase=0
        )
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)

        roadmap_data["id"] = roadmap.id
        return roadmap_data

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")


@router.get("/{user_id}")
async def get_user_roadmap(user_id: str, db: Session = Depends(get_db)):
    """Return roadmap for a user."""
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            return None

        matches = db.query(CareerMatch).filter(CareerMatch.profile_id == profile.id).all()
        if not matches:
            return None

        match_ids = [m.id for m in matches]
        roadmap = db.query(Roadmap).filter(Roadmap.career_match_id.in_(match_ids)).order_by(Roadmap.created_at.desc()).first()

        if not roadmap:
            return None

        return {
            "id": roadmap.id,
            "target_role": roadmap.target_role,
            "total_duration": roadmap.total_duration,
            "milestones": roadmap.milestones,
            "weekly_commitment_hours": roadmap.weekly_commitment_hours,
            "quick_win": roadmap.quick_win,
            "biggest_risk": roadmap.biggest_risk,
            "current_phase": roadmap.current_phase,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch roadmap: {str(e)}")


@router.patch("/{roadmap_id}/progress")
async def update_roadmap_progress(roadmap_id: str, update: RoadmapProgressUpdate, db: Session = Depends(get_db)):
    """Update progress on a roadmap."""
    try:
        roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
        if not roadmap:
            raise HTTPException(status_code=404, detail="Roadmap not found")

        roadmap.current_phase = update.current_phase
        db.commit()

        return {"status": "updated", "current_phase": roadmap.current_phase}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Progress update failed: {str(e)}")
