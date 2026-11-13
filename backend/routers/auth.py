from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import UserCreate, UserLogin, UserResponse, UserUpdate, Token, ModuleAccessResponse
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

VALID_LIFE_STAGES = [
    "school_student",
    "college_student",
    "job_seeker",
    "employee",
    "parent_caregiver",
    "older_adult",
    "other"
]

# NOTE: Legacy aliases have been removed to enforce canonical life‑stage identifiers.
# Existing accounts using old values will continue to work via the normalize_life_stage helper.


LIFE_STAGE_MODULE_MAP = {
    "school_student": {
        "allowed_modules": [
            "school_learning",
            "practice_quizzes",
            "study_planner",
            "safe_ai_tutor",
            "student_tasks",
            "life_radar"
        ],
        "dashboard_layout": "school_student",
        "primary_hub": "School Learning & Practice Hub",
        "disclaimer": "Curriculum oriented for school fundamentals (Math, Science, Social, Languages, Computer Basics)."
    },
    "college_student": {
        "allowed_modules": [
            "college_learning",
            "advanced_practice",
            "internship_placement",
            "resume_review",
            "project_tracker",
            "career_roadmaps",
            "life_radar"
        ],
        "dashboard_layout": "college_student",
        "primary_hub": "College Academic & Placement Hub",
        "disclaimer": "Engineering, Computer Science, Coding, and Placement preparation."
    },
    "job_seeker": {
        "allowed_modules": [
            "career_hub",
            "resume_ats_reviewer",
            "job_application_pipeline",
            "interview_prep",
            "skill_gap_analysis",
            "life_radar"
        ],
        "dashboard_layout": "job_seeker",
        "primary_hub": "Career Acceleration & Job Tracker",
        "disclaimer": "Focused exclusively on resumes, interviews, and application deadlines."
    },
    "employee": {
        "allowed_modules": [
            "employee_growth",
            "certifications",
            "work_task_management",
            "productivity_planner",
            "work_life_balance",
            "life_radar"
        ],
        "dashboard_layout": "employee",
        "primary_hub": "Professional Growth & Workplace Productivity",
        "disclaimer": "Skill upskilling, goal setting, and professional milestone management."
    },
    "parent_caregiver": {
        "allowed_modules": [
            "family_calendar",
            "child_learning_resources",
            "caregiving_schedules",
            "document_renewals",
            "family_wellbeing",
            "life_radar"
        ],
        "dashboard_layout": "parent_caregiver",
        "primary_hub": "Family Management & Caregiver Hub",
        "disclaimer": "Coordination of household responsibilities, caregiving schedules, and child learning."
    },
    "older_adult": {
        "allowed_modules": [
            "cultural_spiritual_learning",
            "bhagavad_gita_study",
            "puranic_stories",
            "scripture_qa",
            "digital_literacy",
            "wellbeing_reminders",
            "essential_services",
            "life_radar"
        ],
        "dashboard_layout": "older_adult",
        "primary_hub": "Cultural Wisdom & Wellbeing Hub",
        "disclaimer": "Accessible font, spiritual study of Bhagavad Gita and Puranas with verified provenance, and everyday assistance."
    },
    "other": {
        "allowed_modules": [
            "general_services",
            "everyday_tasks",
            "ai_assistant",
            "interest_selector",
            "life_radar"
        ],
        "dashboard_layout": "other",
        "primary_hub": "Essential Services & Everyday Platform",
        "disclaimer": "General platform hub configured for everyday life assistance."
    }
}

def normalize_life_stage(stage: str) -> str:
    s = (stage or "").lower().strip()
    if s == "student":
        return "college_student"
    if s == "family":
        return "parent_caregiver"
    if s in LIFE_STAGE_MODULE_MAP:
        return s
    return "other"

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Enforce strict single-admin isolation: public registration can NEVER create an admin
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 2. Hash password with bcrypt
    hashed_password = get_password_hash(user_in.password)

    # 3. Normalize life stage to one of the genuine stages
    # 3. Normalize life stage to one of the genuine stages, handling legacy values
    stage = normalize_life_stage(user_in.life_stage)

    # 4. Create user
    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_password,
        full_name=user_in.full_name.strip(),
        life_stage=stage,
        preferred_language=user_in.preferred_language if user_in.preferred_language in ["en", "hi", "te"] else "en",
        role="user", # STRICT: Never admin
        high_contrast=user_in.high_contrast,
        font_size_preference=user_in.font_size_preference
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 5. Generate JWT token
    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials."
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(update_in: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name.strip()
    if update_in.life_stage is not None and update_in.life_stage in VALID_LIFE_STAGES:
        current_user.life_stage = update_in.life_stage
    if update_in.preferred_language is not None and update_in.preferred_language in ["en", "hi", "te"]:
        current_user.preferred_language = update_in.preferred_language
    if update_in.high_contrast is not None:
        current_user.high_contrast = update_in.high_contrast
    if update_in.font_size_preference is not None:
        current_user.font_size_preference = update_in.font_size_preference
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/modules", response_model=ModuleAccessResponse)
def get_user_module_permissions(current_user: User = Depends(get_current_user)):
    normalized = normalize_life_stage(current_user.life_stage)
    meta = LIFE_STAGE_MODULE_MAP.get(normalized, LIFE_STAGE_MODULE_MAP["other"])
    return ModuleAccessResponse(
        life_stage=current_user.life_stage,
        allowed_modules=meta["allowed_modules"],
        dashboard_layout=meta["dashboard_layout"],
        primary_hub=meta["primary_hub"],
        disclaimer=meta.get("disclaimer")
    )

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully. Client session token invalidated."}
