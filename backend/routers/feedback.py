from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Feedback, User
from backend.schemas import FeedbackCreate, FeedbackResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(payload: FeedbackCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    feedback_entry = Feedback(
        user_id=current_user.id,
        user_email=current_user.email,
        rating=payload.rating,
        category=payload.category,
        message=payload.message.strip(),
        status="new"
    )
    db.add(feedback_entry)
    db.commit()
    db.refresh(feedback_entry)
    return feedback_entry

@router.get("/my", response_model=List[FeedbackResponse])
def get_my_feedback(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Feedback).filter(Feedback.user_id == current_user.id).order_by(Feedback.created_at.desc()).all()
