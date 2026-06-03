from sqlalchemy import Column, String, Integer, Float, JSON, DateTime
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class FeedbackCheckIn(Base):
    __tablename__ = "feedback_checkins"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    roadmap_id = Column(String(36), index=True, nullable=False)
    check_in_date = Column(DateTime(timezone=True), server_default=func.now())
    completion_rate = Column(Float, default=0.0)
    mood_score = Column(Integer, default=5)
    completed_actions = Column(JSON, default=list)
    blockers = Column(JSON, default=list)
    mode = Column(String(50), default="NUDGE")
    ai_response = Column(JSON, default=dict)
