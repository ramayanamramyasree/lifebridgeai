import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import User, Feedback, PracticeAttempt
from backend.schemas import FeedbackResponse, FeedbackStatusUpdate, AdminAnalyticsResponse
from backend.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Administrator Console"])

@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Real database queries
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # Life stage distribution
    stage_rows = db.query(User.life_stage, func.count(User.id)).group_by(User.life_stage).all()
    life_stage_dist = {stage: count for stage, count in stage_rows}
    
    # Language distribution
    lang_rows = db.query(User.preferred_language, func.count(User.id)).group_by(User.preferred_language).all()
    language_dist = {lang: count for lang, count in lang_rows}
    
    # Practice attempts and accuracy
    total_attempts = db.query(func.count(PracticeAttempt.id)).scalar() or 0
    avg_score = db.query(func.avg(PracticeAttempt.score)).scalar() or 0.0
    
    # Feedback
    total_feedback = db.query(func.count(Feedback.id)).scalar() or 0
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0.0
    
    # CatBoost metrics
    metrics_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "metrics.json")
    cb_status = {}
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, "r") as f:
                cb_status = json.load(f)
        except Exception:
            cb_status = {"status": "error_reading_metrics"}
    else:
        cb_status = {"status": "model_not_yet_trained"}
        
    return AdminAnalyticsResponse(
        total_users=total_users,
        life_stage_distribution=life_stage_dist,
        language_distribution=language_dist,
        total_practice_attempts=total_attempts,
        average_practice_score=round(float(avg_score) * 100, 1),
        total_feedback_count=total_feedback,
        average_feedback_rating=round(float(avg_rating), 2),
        catboost_model_status=cb_status
    )

@router.get("/feedback", response_model=List[FeedbackResponse])
def get_all_feedback(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()

@router.put("/feedback/{feedback_id}/status", response_model=FeedbackResponse)
def update_feedback_status(
    feedback_id: int,
    payload: FeedbackStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback entry not found.")
        
    fb.status = payload.status
    if payload.admin_notes is not None:
        fb.admin_notes = payload.admin_notes
        
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/ml-metrics")
def get_detailed_ml_metrics(
    admin: User = Depends(get_current_admin)
):
    metrics_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="CatBoost model metrics file not found. Train model first.")
        
    with open(metrics_path, "r") as f:
        metrics = json.load(f)
    return metrics
