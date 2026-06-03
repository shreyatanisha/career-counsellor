from pydantic import BaseModel
from typing import List, Optional


class RoadmapGenerateRequest(BaseModel):
    profile_id: str
    career_match_id: str


class RoadmapProgressUpdate(BaseModel):
    current_phase: int
    completed_actions: List[str] = []


class FeedbackCheckInRequest(BaseModel):
    roadmap_id: str
    completed_actions: List[str]
    mood_score: int
    blockers: List[str] = []
