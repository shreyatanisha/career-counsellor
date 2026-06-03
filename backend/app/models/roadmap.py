from sqlalchemy import Column, String, Integer, JSON, DateTime
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    career_match_id = Column(String(36), nullable=False, index=True)
    target_role = Column(String(255), nullable=False)
    total_duration = Column(String(255), nullable=True)
    milestones = Column(JSON, default=list)
    weekly_commitment_hours = Column(Integer, default=0)
    quick_win = Column(String(500), nullable=True)
    biggest_risk = Column(String(500), nullable=True)
    current_phase = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
