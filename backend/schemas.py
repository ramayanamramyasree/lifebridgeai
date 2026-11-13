from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    # school_student, college_student, job_seeker, employee, parent_caregiver, older_adult, other (also student, family)
    life_stage: str = Field(default="college_student")
    preferred_language: str = Field(default="en") # en, hi, te
    high_contrast: bool = False
    font_size_preference: str = "normal"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    life_stage: str
    preferred_language: str
    role: str
    high_contrast: bool
    font_size_preference: str
    created_at: datetime

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    life_stage: Optional[str] = None
    preferred_language: Optional[str] = None
    high_contrast: Optional[bool] = None
    font_size_preference: Optional[str] = None

# Module Access Schema
class ModuleAccessResponse(BaseModel):
    life_stage: str
    allowed_modules: List[str]
    dashboard_layout: str
    primary_hub: str
    disclaimer: Optional[str] = None

# Task Schemas
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    category: str = "General"
    due_date: Optional[str] = None
    priority: str = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    category: str
    due_date: Optional[str]
    completed: bool
    priority: str
    created_at: datetime

# Reminder Schemas
class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1)
    reminder_type: str = "medication" # medication, appointment, document, family, general
    prescribed_instructions: Optional[str] = None
    schedule_time: str
    frequency: str = "Daily"

class ReminderAction(BaseModel):
    action: str # "taken", "skipped", "completed"

class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    reminder_type: str
    prescribed_instructions: Optional[str]
    schedule_time: str
    frequency: str
    status: str
    last_action_time: Optional[datetime]
    created_at: datetime

# Learning Schemas
class LearningResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subject: str
    topic: str
    difficulty: str
    academic_level: str
    resource_type: str
    description: str
    explanation: str
    prerequisites: Optional[str]
    key_concepts: Optional[List[str]] = []
    worked_examples: Optional[List[dict]] = []
    practice_questions: Optional[List[dict]] = []
    study_plan: Optional[List[str]] = []
    external_resources: Optional[List[dict]] = []
    source_attribution: Optional[str]
    tags: Optional[str]
    created_at: datetime

# Practice Schemas
class PracticeQuestionResponse(BaseModel):
    id: int
    subject: str
    topic: str
    difficulty: str
    academic_level: Optional[str] = "college"
    question_text: str
    options: List[str]

class PracticeSubmitRequest(BaseModel):
    question_id: int
    selected_option: int

class PracticeSubmitResponse(BaseModel):
    question_id: int
    selected_option: int
    correct_option_index: int
    is_correct: bool
    score: float
    explanation: str

# Career Schemas
class JobApplicationCreate(BaseModel):
    company: str
    role_title: str
    status: str = "applied"
    deadline: Optional[str] = None
    notes: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    deadline: Optional[str] = None
    notes: Optional[str] = None

class JobApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    company: str
    role_title: str
    status: str
    deadline: Optional[str]
    notes: Optional[str]
    created_at: datetime

# Feedback Schemas
class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    category: str = "General"
    message: str = Field(..., min_length=3)

class FeedbackStatusUpdate(BaseModel):
    status: str # new, reviewed, resolved
    admin_notes: Optional[str] = None

class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_email: str
    rating: int
    category: str
    message: str
    status: str
    admin_notes: Optional[str]
    created_at: datetime

# Life Radar Recommendation Schema
class LifeRadarItem(BaseModel):
    id: str
    title: str
    category: str
    reason: str
    priority: str # urgent, high, medium, routine
    next_action: str
    action_type: str
    action_target: str
    source_rule: str
    confidence_score: float

# AI Assistant Schemas
class AIChatMessage(BaseModel):
    role: str # user, assistant
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[AIChatMessage]] = []
    language: Optional[str] = "en"
    topic_context: Optional[str] = None

class AIChatResponse(BaseModel):
    reply: str
    provider: str
    suggestions: List[str]

# Admin Schemas
class AdminAnalyticsResponse(BaseModel):
    total_users: int
    life_stage_distribution: dict
    language_distribution: dict
    total_practice_attempts: int
    average_practice_score: float
    total_feedback_count: int
    average_feedback_rating: float
    catboost_model_status: dict

class MLMetricsResponse(BaseModel):
    model_name: str
    accuracy: float
    f1_score: float
    roc_auc: float
    baseline_accuracy: float
    dataset_rows: int
    features: List[str]
    target: str
    status: str

# --- Cultural & Spiritual Learning Schemas ---

class ScriptureChapterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scripture_name: str
    chapter_number: int
    title_sanskrit: str
    title_transliteration: str
    title_english: str
    title_hindi: str
    title_telugu: str
    verse_count: int
    summary_en: str
    summary_hi: str
    summary_te: str
    key_themes: Optional[List[str]] = []
    source_edition: str
    verification_status: str

class ScripturePassageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    scripture_name: str
    chapter_number: int
    verse_number: int
    sanskrit_devanagari: str
    transliteration: str
    word_meanings: Optional[str] = None
    translation_en: str
    translation_hi: str
    translation_te: str
    commentary_summary: str
    commentary_tradition: str
    source_edition: str
    source_identifier: str
    is_daily_recommended: bool
    verification_status: str
    created_at: datetime

class PuranicStoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    purana_name: str
    canto_section: str
    verse_range: Optional[str] = None
    title: str
    content_type: str
    original_context: str
    story_text_en: str
    story_text_hi: str
    story_text_te: str
    theological_significance: str
    commentary_notes: Optional[str] = None
    source_edition: str
    source_reference: str
    verification_status: str
    created_at: datetime

class ScriptureBookmarkCreate(BaseModel):
    scripture_type: str = "gita" # gita, purana
    item_id: int
    verse_reference: str
    notes: Optional[str] = None

class ScriptureBookmarkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    scripture_type: str
    item_id: int
    verse_reference: str
    notes: Optional[str] = None
    created_at: datetime

class ReadingProgressUpdate(BaseModel):
    scripture_name: str = "Bhagavad Gita"
    chapter_number: int
    verse_number: int
    completed_chapter: Optional[bool] = False

class ReadingProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    scripture_name: str
    chapter_number: int
    verse_number: int
    completed_chapters: List[int]
    last_read_at: datetime

class ScriptureQARequest(BaseModel):
    question: str
    language: Optional[str] = "en"
    scripture_focus: Optional[str] = "all" # gita, purana, all

class ScriptureQAResponse(BaseModel):
    answer: str
    source_citations: List[Dict[str, str]]
    scripture_text_referenced: Optional[str] = None
    commentary_distinction: str
    confidence_status: str # "verified_source_found", "limited_evidence_in_library", "not_found"
