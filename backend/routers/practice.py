import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import PracticeQuestion, PracticeAttempt, User
from backend.schemas import PracticeQuestionResponse, PracticeSubmitRequest, PracticeSubmitResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/practice", tags=["Practice & Assessment"])

@router.get("/questions", response_model=List[PracticeQuestionResponse])
def get_practice_questions(
    subject: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PracticeQuestion)
    if subject and subject != "all":
        query = query.filter(PracticeQuestion.subject.ilike(f"%{subject}%"))
    if difficulty and difficulty != "all":
        query = query.filter(PracticeQuestion.difficulty == difficulty.lower())

    questions = query.limit(30).all()
    results = []
    for q in questions:
        opts = json.loads(q.options_json) if q.options_json else []
        results.append(
            PracticeQuestionResponse(
                id=q.id,
                subject=q.subject,
                topic=q.topic,
                difficulty=q.difficulty,
                question_text=q.question_text,
                options=opts
            )
        )
    return results

@router.post("/submit", response_model=PracticeSubmitResponse)
def submit_practice_answer(
    submission: PracticeSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(PracticeQuestion).filter(PracticeQuestion.id == submission.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Practice question not found.")

    is_correct = (submission.selected_option == question.correct_option_index)
    score = 1.0 if is_correct else 0.0

    attempt = PracticeAttempt(
        user_id=current_user.id,
        question_id=question.id,
        selected_option=submission.selected_option,
        is_correct=is_correct,
        score=score
    )
    db.add(attempt)
    db.commit()

    return PracticeSubmitResponse(
        question_id=question.id,
        selected_option=submission.selected_option,
        correct_option_index=question.correct_option_index,
        is_correct=is_correct,
        score=score,
        explanation=question.explanation
    )

@router.get("/history")
def get_user_practice_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = db.query(PracticeAttempt).filter(PracticeAttempt.user_id == current_user.id).order_by(PracticeAttempt.created_at.desc()).all()
    total_attempts = len(attempts)
    correct_attempts = sum(1 for a in attempts if a.is_correct)
    accuracy = round((correct_attempts / total_attempts) * 100, 1) if total_attempts > 0 else 0.0

    return {
        "total_attempts": total_attempts,
        "correct_attempts": correct_attempts,
        "accuracy_percentage": accuracy,
        "recent_attempts": [
            {
                "id": a.id,
                "question_id": a.question_id,
                "is_correct": a.is_correct,
                "score": a.score,
                "created_at": a.created_at
            }
            for a in attempts[:10]
        ]
    }
