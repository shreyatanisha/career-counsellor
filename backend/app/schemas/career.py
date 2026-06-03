from pydantic import BaseModel
from typing import List, Optional


class CareerMatchRequest(BaseModel):
    profile: dict


class CareerMatchResponse(BaseModel):
    rank: int
    role: str
    fit_score: float
    why_matched: str
    salary_range_inr: dict
    growth_outlook: str
    growth_reason: Optional[str] = ""
    required_skills: List[str] = []
    user_has: List[str] = []
    user_lacks: List[str] = []
    time_to_job_ready: str
