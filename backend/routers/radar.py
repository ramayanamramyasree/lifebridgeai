from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Task, Reminder, PracticeAttempt, JobApplication, LearningResource
from backend.schemas import LifeRadarItem
from backend.auth import get_current_user
from backend.ml.inference import get_ml_predictor

router = APIRouter(prefix="/api/radar", tags=["Life Radar Recommendations"])

@router.get("", response_model=List[LifeRadarItem])
def get_life_radar_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    predictor = get_ml_predictor()
    
    # 1. Fetch user context
    tasks = db.query(Task).filter(Task.user_id == current_user.id, Task.completed == False).all()
    reminders = db.query(Reminder).filter(Reminder.user_id == current_user.id, Reminder.status == "active").all()
    attempts = db.query(PracticeAttempt).filter(PracticeAttempt.user_id == current_user.id).all()
    job_apps = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    
    total_attempts = len(attempts)
    correct_attempts = sum(1 for a in attempts if a.is_correct)
    accuracy_ratio = (correct_attempts / total_attempts) if total_attempts > 0 else 0.5
    
    recommendations: List[LifeRadarItem] = []
    
    # Candidate generator based on user persona and activity
    candidates = []
    
    # Candidate: Incomplete high-priority task
    if tasks:
        high_task = next((t for t in tasks if t.priority == "high"), tasks[0])
        candidates.append({
            "id": f"radar-task-{high_task.id}",
            "title": f"Action Required: Complete '{high_task.title}'",
            "category": "Task Management",
            "reason": f"Identified as pending in your personal task log with priority {high_task.priority}.",
            "priority": "high" if high_task.priority == "high" else "medium",
            "next_action": "Open Tasks tab and mark as done once finished.",
            "action_type": "navigate_task",
            "action_target": "/dashboard?tab=tasks",
            "source_rule": "Rule: Pending user task priority evaluation",
            "ml_features": {
                "life_stage": current_user.life_stage,
                "goal_category": "task_completion",
                "topic_category": "wellbeing_reminder",
                "task_urgency": "high" if high_task.priority == "high" else "medium",
                "difficulty_level": "intermediate",
                "resource_type": "checklist",
                "days_until_deadline": 2,
                "progress_ratio": 0.4,
                "user_feedback_signal": 4.5,
                "interaction_count": total_attempts + len(tasks)
            }
        })
        
    # Candidate: Active Medication / Appointment Reminder
    if reminders:
        first_rem = reminders[0]
        candidates.append({
            "id": f"radar-rem-{first_rem.id}",
            "title": f"Scheduled Routine: {first_rem.title} ({first_rem.schedule_time})",
            "category": "Wellbeing Schedule",
            "reason": "Active routine reminder configured according to your clinician instructions.",
            "priority": "urgent" if first_rem.reminder_type == "medication" else "high",
            "next_action": "Confirm adherence in the Reminders panel.",
            "action_type": "navigate_reminder",
            "action_target": "/dashboard?tab=reminders",
            "source_rule": "Rule: User-scheduled daily adherence protocol",
            "ml_features": {
                "life_stage": current_user.life_stage,
                "goal_category": "health_routine",
                "topic_category": "wellbeing_reminder",
                "task_urgency": "critical" if first_rem.reminder_type == "medication" else "high",
                "difficulty_level": "beginner",
                "resource_type": "medication_schedule",
                "days_until_deadline": 1,
                "progress_ratio": 0.8,
                "user_feedback_signal": 4.8,
                "interaction_count": 5
            }
        })
        
    # Persona-specific candidates
    if current_user.life_stage == "student":
        # Candidate 1: Practice Quiz & Diagnostic
        candidates.append({
            "id": "radar-student-quiz",
            "title": "Sharpen Core Skills: Solve 5 Computer Science MCQs",
            "category": "Skill Assessment",
            "reason": "Regular practice retrieval strengthens long-term concept retention.",
            "priority": "medium",
            "next_action": "Complete a 5-question quick assessment session.",
            "action_type": "navigate_practice",
            "action_target": "/practice",
            "source_rule": "Rule: Active recall pacing for academic growth",
            "ml_features": {
                "life_stage": "student",
                "goal_category": "exam_prep",
                "topic_category": "computer_science",
                "task_urgency": "medium",
                "difficulty_level": "intermediate",
                "resource_type": "quiz_practice",
                "days_until_deadline": 7,
                "progress_ratio": accuracy_ratio,
                "user_feedback_signal": 4.2,
                "interaction_count": total_attempts
            }
        })
        # Candidate 2: Master Big-O Complexity
        candidates.append({
            "id": "radar-student-learning",
            "title": "Study Deep-Dive: Big-O Asymptotic Complexity",
            "category": "Learning Concept",
            "reason": "Essential prerequisite for upcoming technical assessments and university coursework.",
            "priority": "high",
            "next_action": "Review the interactive Big-O guide and worked examples.",
            "action_type": "navigate_learning",
            "action_target": "/learning?q=Big-O",
            "source_rule": "Rule: Foundational syllabus milestone",
            "ml_features": {
                "life_stage": "student",
                "goal_category": "skill_upskilling",
                "topic_category": "computer_science",
                "task_urgency": "high",
                "difficulty_level": "beginner",
                "resource_type": "concept_guide",
                "days_until_deadline": 5,
                "progress_ratio": 0.2,
                "user_feedback_signal": 4.6,
                "interaction_count": 3
            }
        })
        
    elif current_user.life_stage == "job_seeker":
        # Candidate 1: Resume Optimization
        candidates.append({
            "id": "radar-job-resume",
            "title": "Career Readiness: Benchmark Your Resume ATS Score",
            "category": "Career Preparation",
            "reason": "Structured keywords and quantifiable metrics increase recruiter callback rates.",
            "priority": "high",
            "next_action": "Paste your resume into the Resume Reviewer for immediate scoring.",
            "action_type": "navigate_career",
            "action_target": "/career?tool=resume",
            "source_rule": "Rule: Career profile readiness audit",
            "ml_features": {
                "life_stage": "job_seeker",
                "goal_category": "career_switch",
                "topic_category": "interview_prep",
                "task_urgency": "high",
                "difficulty_level": "intermediate",
                "resource_type": "checklist",
                "days_until_deadline": 4,
                "progress_ratio": 0.3,
                "user_feedback_signal": 4.4,
                "interaction_count": len(job_apps)
            }
        })
        # Candidate 2: Interview Practice
        candidates.append({
            "id": "radar-job-interview",
            "title": "Mock Technical Interview: Algorithms & System Design",
            "category": "Interview Practice",
            "reason": "Active practice with live problem walkthroughs improves interview performance.",
            "priority": "medium",
            "next_action": "Run through 3 mock technical prompts in the Practice Hub.",
            "action_type": "navigate_practice",
            "action_target": "/practice?subject=Computer+Science",
            "source_rule": "Rule: Pre-interview simulation frequency",
            "ml_features": {
                "life_stage": "job_seeker",
                "goal_category": "career_switch",
                "topic_category": "interview_prep",
                "task_urgency": "medium",
                "difficulty_level": "advanced",
                "resource_type": "mock_interview",
                "days_until_deadline": 10,
                "progress_ratio": 0.5,
                "user_feedback_signal": 4.1,
                "interaction_count": total_attempts
            }
        })
        
    else: # family or older_adult
        candidates.append({
            "id": "radar-wellbeing-routine",
            "title": "Accessibility Check & High-Contrast Review",
            "category": "Accessibility & Comfort",
            "reason": "Ensure clear legibility and large text settings for comfortable navigation.",
            "priority": "routine",
            "next_action": "Toggle high-contrast or larger font controls in the dashboard toolbar.",
            "action_type": "accessibility_toggle",
            "action_target": "/dashboard?settings=accessibility",
            "source_rule": "Rule: Accessible user interface preference",
            "ml_features": {
                "life_stage": current_user.life_stage,
                "goal_category": "health_routine",
                "topic_category": "wellbeing_reminder",
                "task_urgency": "low",
                "difficulty_level": "beginner",
                "resource_type": "checklist",
                "days_until_deadline": 14,
                "progress_ratio": 0.9,
                "user_feedback_signal": 4.9,
                "interaction_count": 2
            }
        })
        candidates.append({
            "id": "radar-family-doc",
            "title": "Document Expiry & Health Checkup Planning",
            "category": "Life Responsibilities",
            "reason": "Prevent unexpected lapse of health insurance or identification renewals.",
            "next_action": "Review your configured personal deadlines.",
            "priority": "medium",
            "action_type": "navigate_task",
            "action_target": "/dashboard?tab=tasks",
            "source_rule": "Rule: Life administration proactive maintenance",
            "ml_features": {
                "life_stage": current_user.life_stage,
                "goal_category": "appointment_adherence",
                "topic_category": "document_renewal",
                "task_urgency": "medium",
                "difficulty_level": "intermediate",
                "resource_type": "checklist",
                "days_until_deadline": 21,
                "progress_ratio": 0.5,
                "user_feedback_signal": 4.3,
                "interaction_count": 4
            }
        })
        
    # Evaluate candidates with CatBoost ML predictor
    for cand in candidates:
        ml_features = cand["ml_features"]
        confidence = predictor.predict_relevance(ml_features)
        recommendations.append(
            LifeRadarItem(
                id=cand["id"],
                title=cand["title"],
                category=cand["category"],
                reason=cand["reason"],
                priority=cand["priority"],
                next_action=cand["next_action"],
                action_type=cand["action_type"],
                action_target=cand["action_target"],
                source_rule=cand["source_rule"],
                confidence_score=round(confidence, 3)
            )
        )
        
    # Rank recommendations by predicted confidence score descending
    recommendations.sort(key=lambda item: item.confidence_score, reverse=True)
    return recommendations
