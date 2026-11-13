import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.database import get_db
from backend.models import LearningResource, Bookmark, User
from backend.schemas import LearningResourceResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/learning", tags=["Learning Hub"])

def format_resource(res: LearningResource) -> dict:
    return {
        "id": res.id,
        "title": res.title,
        "subject": res.subject,
        "topic": res.topic,
        "difficulty": res.difficulty,
        "academic_level": res.academic_level,
        "resource_type": res.resource_type,
        "description": res.description,
        "explanation": res.explanation,
        "prerequisites": res.prerequisites,
        "key_concepts": json.loads(res.key_concepts_json) if res.key_concepts_json else [],
        "worked_examples": json.loads(res.worked_examples_json) if res.worked_examples_json else [],
        "practice_questions": json.loads(res.practice_questions_json) if res.practice_questions_json else [],
        "study_plan": json.loads(res.study_plan_json) if res.study_plan_json else [],
        "external_resources": json.loads(res.external_resources_json) if res.external_resources_json else [],
        "source_attribution": res.source_attribution,
        "tags": res.tags,
        "created_at": res.created_at
    }

@router.get("/search", response_model=List[LearningResourceResponse])
def search_learning_resources(
    q: Optional[str] = Query(None, description="Search keyword in title, topic, description, or tags"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    difficulty: Optional[str] = Query(None, description="beginner, intermediate, advanced"),
    academic_level: Optional[str] = Query(None, description="school, college, competitive, interview"),
    resource_type: Optional[str] = Query(None, description="concept, worked_example, study_guide, notes"),
    db: Session = Depends(get_db)
):
    query = db.query(LearningResource)

    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                LearningResource.title.ilike(term),
                LearningResource.topic.ilike(term),
                LearningResource.subject.ilike(term),
                LearningResource.description.ilike(term),
                LearningResource.explanation.ilike(term),
                LearningResource.tags.ilike(term)
            )
        )

    if subject and subject != "all":
        query = query.filter(LearningResource.subject.ilike(f"%{subject}%"))

    if difficulty and difficulty != "all":
        query = query.filter(LearningResource.difficulty == difficulty.lower())

    if academic_level and academic_level != "all":
        query = query.filter(LearningResource.academic_level == academic_level.lower())

    if resource_type and resource_type != "all":
        query = query.filter(LearningResource.resource_type == resource_type.lower())

    results = query.order_by(LearningResource.id.asc()).limit(50).all()
    return [format_resource(r) for r in results]

@router.get("/topics")
def get_topics_and_subjects(db: Session = Depends(get_db)):
    resources = db.query(LearningResource.subject, LearningResource.topic).distinct().all()
    subjects_map = {}
    for s, t in resources:
        if s not in subjects_map:
            subjects_map[s] = []
        if t not in subjects_map[s]:
            subjects_map[s].append(t)
    return {"subjects": list(subjects_map.keys()), "subject_topics": subjects_map}

@router.get("/resources/{resource_id}", response_model=LearningResourceResponse)
def get_resource_detail(resource_id: int, db: Session = Depends(get_db)):
    res = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Learning resource not found.")
    return format_resource(res)

@router.get("/bookmarks")
def get_bookmarks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookmarks = db.query(Bookmark).filter(Bookmark.user_id == current_user.id).all()
    res_ids = [b.resource_id for b in bookmarks]
    resources = db.query(LearningResource).filter(LearningResource.id.in_(res_ids)).all() if res_ids else []
    return [format_resource(r) for r in resources]

@router.post("/bookmarks/{resource_id}")
def toggle_bookmark(resource_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found.")
    
    existing = db.query(Bookmark).filter(
        Bookmark.user_id == current_user.id,
        Bookmark.resource_id == resource_id
    ).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False, "message": "Bookmark removed"}
    else:
        new_bm = Bookmark(user_id=current_user.id, resource_id=resource_id)
        db.add(new_bm)
        db.commit()
        return {"bookmarked": True, "message": "Bookmark added"}
