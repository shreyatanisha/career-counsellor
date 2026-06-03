from pydantic import BaseModel
from typing import List, Optional


class IntakeStartResponse(BaseModel):
    session_id: str
    message: str


class IntakeRespondRequest(BaseModel):
    session_id: str
    message: str
    history: List[dict]
    user_id: Optional[str] = None


class IntakeRespondResponse(BaseModel):
    message: str
    is_complete: bool
    profile: Optional[dict] = None
    history: List[dict]
