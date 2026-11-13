from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Reminder, User
from backend.schemas import ReminderCreate, ReminderAction, ReminderResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/reminders", tags=["Safe Reminders & Wellbeing"])

SAFETY_DISCLOSURE = (
    "DISCLOSURE: LifeBridge AI does not prescribe medications, adjust dosages, or diagnose health conditions. "
    "All reminders reflect strictly user-configured schedules entered in accordance with clinician instructions."
)

@router.get("/disclosure")
def get_safety_disclosure():
    return {
        "safety_statement": SAFETY_DISCLOSURE,
        "is_prescription_service": False,
        "recommendation": "Always consult a qualified healthcare professional regarding prescriptions or medical advice."
    }

@router.get("", response_model=List[ReminderResponse])
def get_user_reminders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Reminder).filter(Reminder.user_id == current_user.id).order_by(Reminder.created_at.desc()).all()

@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(payload: ReminderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Validate reminder type
    valid_types = ["medication", "appointment", "document", "general"]
    r_type = payload.reminder_type if payload.reminder_type in valid_types else "general"

    reminder = Reminder(
        user_id=current_user.id,
        title=payload.title.strip(),
        reminder_type=r_type,
        prescribed_instructions=payload.prescribed_instructions.strip() if payload.prescribed_instructions else None,
        schedule_time=payload.schedule_time.strip(),
        frequency=payload.frequency,
        status="active"
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder

@router.post("/{reminder_id}/action", response_model=ReminderResponse)
def log_reminder_action(
    reminder_id: int,
    action_in: ReminderAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found or access denied.")

    valid_actions = ["taken", "skipped", "completed", "active"]
    act = action_in.action.lower()
    if act not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Expected one of: {valid_actions}")

    reminder.status = act
    reminder.last_action_time = datetime.utcnow()
    db.commit()
    db.refresh(reminder)
    return reminder

@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reminder = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()

    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found or access denied.")

    db.delete(reminder)
    db.commit()
    return {"message": "Reminder deleted successfully."}
