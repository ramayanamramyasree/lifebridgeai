from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Task, User
from backend.schemas import TaskCreate, TaskUpdate, TaskResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Personal Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_user_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.created_at.desc()).all()

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = Task(
        user_id=current_user.id,
        title=payload.title.strip(),
        category=payload.category,
        due_date=payload.due_date,
        priority=payload.priority,
        completed=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or access denied.")

    if payload.title is not None:
        task.title = payload.title.strip()
    if payload.category is not None:
        task.category = payload.category
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.completed is not None:
        task.completed = payload.completed
    if payload.priority is not None:
        task.priority = payload.priority

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or access denied.")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully."}
