from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ai_service import analyse_gaps
from app.models.profile import UserProfile
from app.models.career_match import CareerMatch
import json

router = APIRouter()

# Temporary in-memory cache for gap analysis since it doesn't have a SQL model
# In production, this should be a DB table or Redis cache.
gap_analyses_cache = {}


@router.post("/analyse")
async def analyse_gaps_endpoint(profile_id: str, career_match_id: str, db: Session = Depends(get_db)):
    """Run AI gap analysis for a career match."""
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == profile_id).first()
        career = db.query(CareerMatch).filter(CareerMatch.id == career_match_id).first()

        profile_data = {
            "skills": profile.skills if profile else [],
            "education": profile.education if profile else "",
        }

        career_data = {
            "role": career.role if career else "",
            "required_skills": career.required_skills if career else [],
            "user_has": career.user_has if career else [],
            "user_lacks": career.user_lacks if career else [],
        }

        result = await analyse_gaps(profile_data, career_data)

        # Cache in memory
        gap_analyses_cache[profile_id] = result

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gap analysis failed: {str(e)}")


@router.get("/{profile_id}")
async def get_gap_analysis(profile_id: str):
    """Return saved gap analysis for a profile."""
    return gap_analyses_cache.get(profile_id)
