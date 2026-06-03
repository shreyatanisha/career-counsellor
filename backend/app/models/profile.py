from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), index=True, nullable=False)
    education = Column(String(500), nullable=True)
    skills = Column(JSON, default=list)
    interests = Column(JSON, default=list)
    personality = Column(String(500), nullable=True)
    constraints = Column(JSON, default=dict)
    frustration = Column(String(1000), nullable=True)
    readiness_score = Column(Integer, default=0)
    raw_answers = Column(JSON, default=list)
    intake_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
