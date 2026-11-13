from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    # Life stages: school_student, college_student, job_seeker, employee, parent_caregiver, older_adult, other (also student, family for backward compat)
    life_stage = Column(String(50), default="college_student")
    preferred_language = Column(String(10), default="en") # en, hi, te
    role = Column(String(20), default="user") # user, admin
    high_contrast = Column(Boolean, default=False)
    font_size_preference = Column(String(20), default="normal")
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    practice_attempts = relationship("PracticeAttempt", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    scripture_bookmarks = relationship("ScriptureBookmark", back_populates="user", cascade="all, delete-orphan")
    reading_progress = relationship("ReadingProgress", back_populates="user", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="General") # Academic, Career, Work, Health, Family, Personal
    due_date = Column(String(50), nullable=True)
    completed = Column(Boolean, default=False)
    priority = Column(String(20), default="medium") # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tasks")

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    reminder_type = Column(String(50), default="medication") # medication, appointment, document, family, general
    prescribed_instructions = Column(Text, nullable=True) # Clinician-prescribed instructions entered by user
    schedule_time = Column(String(50), nullable=False) # e.g. "08:00 AM" or "2026-11-05 14:00"
    frequency = Column(String(50), default="Daily") # Daily, Twice Daily, Weekly, One-time
    status = Column(String(30), default="active") # active, taken, skipped, completed
    last_action_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reminders")

class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    subject = Column(String(100), nullable=False, index=True)
    topic = Column(String(100), nullable=False, index=True)
    difficulty = Column(String(30), default="intermediate") # beginner, intermediate, advanced
    academic_level = Column(String(50), default="college") # school, college, competitive, interview, professional
    resource_type = Column(String(50), default="concept") # concept, worked_example, study_guide, notes
    description = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    prerequisites = Column(Text, nullable=True)
    key_concepts_json = Column(Text, nullable=True) # JSON list
    worked_examples_json = Column(Text, nullable=True) # JSON list
    practice_questions_json = Column(Text, nullable=True) # JSON list
    study_plan_json = Column(Text, nullable=True) # JSON list
    external_resources_json = Column(Text, nullable=True) # JSON list of curated links
    source_attribution = Column(String(255), nullable=True)
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PracticeQuestion(Base):
    __tablename__ = "practice_questions"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(100), nullable=False, index=True)
    topic = Column(String(100), nullable=False, index=True)
    difficulty = Column(String(30), default="medium") # easy, medium, hard
    academic_level = Column(String(50), default="college") # school, college, interview, general
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False) # JSON list of 4 options
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PracticeAttempt(Base):
    __tablename__ = "practice_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("practice_questions.id"), nullable=False)
    selected_option = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="practice_attempts")
    question = relationship("PracticeQuestion")

class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resource_id = Column(Integer, ForeignKey("learning_resources.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookmarks")
    resource = relationship("LearningResource")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user_email = Column(String(255), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    category = Column(String(50), nullable=False) # General, Learning, Career, Accessibility, Cultural, Bug
    message = Column(Text, nullable=False)
    status = Column(String(30), default="new") # new, reviewed, resolved
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company = Column(String(100), nullable=False)
    role_title = Column(String(100), nullable=False)
    status = Column(String(50), default="applied") # saved, applied, interviewing, offered, rejected
    deadline = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="job_applications")

# --- Cultural & Spiritual Learning Models ---

class ScriptureChapter(Base):
    __tablename__ = "scripture_chapters"

    id = Column(Integer, primary_key=True, index=True)
    scripture_name = Column(String(100), default="Bhagavad Gita", index=True)
    chapter_number = Column(Integer, nullable=False, index=True)
    title_sanskrit = Column(String(255), nullable=False)
    title_transliteration = Column(String(255), nullable=False)
    title_english = Column(String(255), nullable=False)
    title_hindi = Column(String(255), nullable=False)
    title_telugu = Column(String(255), nullable=False)
    verse_count = Column(Integer, nullable=False)
    summary_en = Column(Text, nullable=False)
    summary_hi = Column(Text, nullable=False)
    summary_te = Column(Text, nullable=False)
    key_themes = Column(Text, nullable=True) # JSON list of philosophical themes
    source_edition = Column(String(255), nullable=False) # e.g. "Gita Press Gorakhpur Edition / Public Domain"
    verification_status = Column(String(50), default="verified")

class ScripturePassage(Base):
    __tablename__ = "scripture_passages"

    id = Column(Integer, primary_key=True, index=True)
    scripture_name = Column(String(100), default="Bhagavad Gita", index=True)
    chapter_number = Column(Integer, nullable=False, index=True)
    verse_number = Column(Integer, nullable=False, index=True)
    sanskrit_devanagari = Column(Text, nullable=False)
    transliteration = Column(Text, nullable=False)
    word_meanings = Column(Text, nullable=True) # Word-by-word Sanskrit to English/Hindi
    translation_en = Column(Text, nullable=False)
    translation_hi = Column(Text, nullable=False)
    translation_te = Column(Text, nullable=False)
    commentary_summary = Column(Text, nullable=False)
    commentary_tradition = Column(String(255), default="Classical Vedanta & Ethical Universalism")
    source_edition = Column(String(255), nullable=False) # Provenance attribution
    source_identifier = Column(String(100), nullable=False) # e.g. "BG 2.47"
    is_daily_recommended = Column(Boolean, default=False)
    verification_status = Column(String(50), default="verified")
    created_at = Column(DateTime, default=datetime.utcnow)

class PuranicStory(Base):
    __tablename__ = "puranic_stories"

    id = Column(Integer, primary_key=True, index=True)
    purana_name = Column(String(100), nullable=False, index=True) # Bhagavata Purana, Vishnu Purana, Shiva Purana, Markandeya Purana
    canto_section = Column(String(100), nullable=False) # e.g. "Canto 1, Chapter 3", "Section 1"
    verse_range = Column(String(100), nullable=True) # e.g. "Verses 1-28"
    title = Column(String(255), nullable=False, index=True)
    content_type = Column(String(50), default="verified_passage_translation") # verified_passage_translation, traditional_scholarly_retelling, ethical_summary
    original_context = Column(Text, nullable=False) # Speaker and context dialogue
    story_text_en = Column(Text, nullable=False)
    story_text_hi = Column(Text, nullable=False)
    story_text_te = Column(Text, nullable=False)
    theological_significance = Column(Text, nullable=False)
    commentary_notes = Column(Text, nullable=True) # Distinguishes scriptural root from regional variants
    source_edition = Column(String(255), nullable=False)
    source_reference = Column(String(100), nullable=False) # e.g. "Bhagavata Purana 7.5.23-24"
    verification_status = Column(String(50), default="verified")
    created_at = Column(DateTime, default=datetime.utcnow)

class ScriptureBookmark(Base):
    __tablename__ = "scripture_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scripture_type = Column(String(50), default="gita") # gita, purana
    item_id = Column(Integer, nullable=False)
    verse_reference = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scripture_bookmarks")

class ReadingProgress(Base):
    __tablename__ = "reading_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scripture_name = Column(String(100), default="Bhagavad Gita")
    chapter_number = Column(Integer, nullable=False)
    verse_number = Column(Integer, default=1)
    completed_chapters_json = Column(Text, default="[]") # JSON list of completed chapters
    last_read_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reading_progress")
