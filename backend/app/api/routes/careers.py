from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.career import CareerMatchRequest
from app.services.ai_service import match_careers
from app.models.career_match import CareerMatch
from app.models.profile import UserProfile

router = APIRouter()


@router.post("/match")
async def match_careers_endpoint(request: CareerMatchRequest, db: Session = Depends(get_db)):
    """Run AI career matching on a user profile. Returns 3 ranked matches."""
    try:
        matches = await match_careers(request.profile)
        profile_id = request.profile.get("profile_id")
        saved_matches = []

        # Find actual profile ID in DB to attach reference if provided
        db_profile = None
        if profile_id:
            db_profile = db.query(UserProfile).filter(UserProfile.user_id == profile_id).first()

        for match_data in matches:
            salary = match_data.get("salary_range_inr", {})
            cm = CareerMatch(
                profile_id=db_profile.id if db_profile else "anonymous",
                rank=match_data.get("rank", 0),
                role=match_data.get("role", ""),
                fit_score=match_data.get("fit_score", 0),
                why_matched=match_data.get("why_matched", ""),
                salary_min_inr=salary.get("min", 0),
                salary_max_inr=salary.get("max", 0),
                growth_outlook=match_data.get("growth_outlook", ""),
                required_skills=match_data.get("required_skills", []),
                user_has=match_data.get("user_has", []),
                user_lacks=match_data.get("user_lacks", []),
                time_to_job_ready=match_data.get("time_to_job_ready", "")
            )
            db.add(cm)
            db.flush()
            
            match_data["id"] = cm.id
            saved_matches.append(match_data)

        db.commit()
        return saved_matches

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Career matching failed: {str(e)}")


@router.get("/{user_id}")
async def get_user_careers(user_id: str, db: Session = Depends(get_db)):
    """Return saved career matches for a user."""
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            return []

        matches = db.query(CareerMatch).filter(CareerMatch.profile_id == profile.id).order_by(CareerMatch.rank).all()

        return [
            {
                "id": m.id,
                "rank": m.rank,
                "role": m.role,
                "fit_score": m.fit_score,
                "why_matched": m.why_matched,
                "salary_range_inr": {"min": m.salary_min_inr or 0, "max": m.salary_max_inr or 0},
                "growth_outlook": m.growth_outlook,
                "required_skills": m.required_skills,
                "user_has": m.user_has,
                "user_lacks": m.user_lacks,
                "time_to_job_ready": m.time_to_job_ready,
            }
            for m in matches
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch careers: {str(e)}")
