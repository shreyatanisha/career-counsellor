from sqlalchemy import Column, String, Float, Integer, JSON, DateTime
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class CareerMatch(Base):
    __tablename__ = "career_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), index=True, nullable=False)
    rank = Column(Integer, nullable=False)
    role = Column(String(255), nullable=False)
    fit_score = Column(Float, nullable=False)
    why_matched = Column(String(1000), nullable=True)
    salary_min_inr = Column(Integer, nullable=True)
    salary_max_inr = Column(Integer, nullable=True)
    growth_outlook = Column(String(100), nullable=True)
    required_skills = Column(JSON, default=list)
    user_has = Column(JSON, default=list)
    user_lacks = Column(JSON, default=list)
    time_to_job_ready = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
