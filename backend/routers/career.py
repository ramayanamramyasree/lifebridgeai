from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import JobApplication, User
from backend.schemas import JobApplicationCreate, JobApplicationUpdate, JobApplicationResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/api/career", tags=["Career Hub"])

class ResumeReviewRequest(BaseModel):
    target_role: str
    resume_text: str

class ResumeReviewResponse(BaseModel):
    ats_score: int
    strengths: List[str]
    improvements: List[str]
    missing_keywords: List[str]
    recommended_projects: List[str]
    summary_verdict: str

@router.get("/roadmaps")
def get_career_roadmaps():
    return [
        {
            "id": "fullstack-swe",
            "title": "Full-Stack Software Engineering",
            "category": "Software Development",
            "description": "End-to-end modern web applications, scalable APIs, and production deployments.",
            "duration_months": 6,
            "stages": [
                {
                    "stage": 1,
                    "title": "Core Foundations & DSA",
                    "skills": ["Data Structures", "Algorithms (Big-O, Sorting, Graphs)", "Git & Version Control"],
                    "milestone": "Solve 50 curated LeetCode/HackerRank problems in Python or TypeScript."
                },
                {
                    "stage": 2,
                    "title": "Backend Engineering & SQL",
                    "skills": ["FastAPI / Node.js", "Relational Database Design (PostgreSQL/SQLite)", "RESTful API Security & JWT"],
                    "milestone": "Build an authenticated multi-tenant CRUD service with unit tests."
                },
                {
                    "stage": 3,
                    "title": "Frontend & Modern UI",
                    "skills": ["React 18", "Next.js App Router", "Tailwind CSS", "State Management"],
                    "milestone": "Build responsive, accessible dashboard with server-side rendering."
                },
                {
                    "stage": 4,
                    "title": "DevOps & System Architecture",
                    "skills": ["Docker Containerization", "CI/CD Pipelines", "System Design & Caching (Redis)"],
                    "milestone": "Deploy complete full-stack project with automated tests and monitoring."
                }
            ]
        },
        {
            "id": "ai-ml-engineer",
            "title": "AI & Machine Learning Engineering",
            "category": "Artificial Intelligence",
            "description": "From tabular modeling and gradient boosting to deep learning and LLM applications.",
            "duration_months": 8,
            "stages": [
                {
                    "stage": 1,
                    "title": "Math Foundations & Python Data Stack",
                    "skills": ["Linear Algebra & Matrix Calculus", "NumPy & Pandas", "Probability & Hypothesis Testing"],
                    "milestone": "Conduct exploratory data analysis on real open datasets."
                },
                {
                    "stage": 2,
                    "title": "Applied Machine Learning",
                    "skills": ["CatBoost & XGBoost", "Scikit-Learn Pipelines", "Cross-Validation & Metric Tuning"],
                    "milestone": "Train, evaluate, and benchmark tabular classification models."
                },
                {
                    "stage": 3,
                    "title": "Deep Learning & NLP",
                    "skills": ["PyTorch", "Transformer Architecture", "Embedding Retrieval & RAG"],
                    "milestone": "Deploy an embedding search assistant with vector indexing."
                },
                {
                    "stage": 4,
                    "title": "MLOps & Model Serving",
                    "skills": ["FastAPI Model Serving", "Docker for ML", "Model Monitoring & Drift Detection"],
                    "milestone": "Containerize an inference microservice with automated regression tests."
                }
            ]
        },
        {
            "id": "cybersecurity-analyst",
            "title": "Cybersecurity & Information Security",
            "category": "Security Engineering",
            "description": "Network defenses, application security, vulnerability assessment, and threat mitigation.",
            "duration_months": 6,
            "stages": [
                {
                    "stage": 1,
                    "title": "Networking & Protocols",
                    "skills": ["TCP/IP, DNS, TLS/SSL", "Wireshark Packet Analysis", "Linux Hardening"],
                    "milestone": "Configure segmented network firewall rules and audit traffic."
                },
                {
                    "stage": 2,
                    "title": "Web Application Security",
                    "skills": ["OWASP Top 10", "SQL Injection / XSS / CSRF mitigation", "OAuth2 & JWT validation"],
                    "milestone": "Audit a vulnerable web application and remediate flaws."
                },
                {
                    "stage": 3,
                    "title": "Security Operations & Incident Response",
                    "skills": ["SIEM Tools", "Log Forensics", "Vulnerability Scanning"],
                    "milestone": "Simulate and draft an incident response containment report."
                }
            ]
        }
    ]

@router.post("/resume-review", response_model=ResumeReviewResponse)
def review_resume(payload: ResumeReviewRequest, current_user: User = Depends(get_current_user)):
    text_lower = payload.resume_text.lower()
    role_lower = payload.target_role.lower()
    
    # Calculate structured ATS metrics based on keyword presence and quantifiable metrics
    keywords_swe = ["python", "react", "fastapi", "sql", "git", "api", "docker", "testing", "ci/cd"]
    keywords_ml = ["machine learning", "python", "pandas", "pytorch", "catboost", "scikit-learn", "data", "model", "evaluation"]
    
    selected_keywords = keywords_ml if ("ml" in role_lower or "ai" in role_lower or "data" in role_lower) else keywords_swe
    
    present_keywords = [kw for kw in selected_keywords if kw in text_lower]
    missing = [kw for kw in selected_keywords if kw not in text_lower]
    
    has_metrics = any(char.isdigit() for char in payload.resume_text)
    
    # Calculate score
    base_score = 45
    score = base_score + int((len(present_keywords) / len(selected_keywords)) * 40)
    if has_metrics:
        score += 12
    score = min(max(score, 30), 96)
    
    strengths = []
    if len(present_keywords) >= 4:
        strengths.append(f"Strong alignment with foundational tools: {', '.join(present_keywords[:4])}.")
    if has_metrics:
        strengths.append("Includes quantifiable impact indicators (e.g. percentages, user counts, performance gains).")
    strengths.append("Clear section formatting and career orientation.")
    
    improvements = []
    if missing:
        improvements.append(f"Consider explicitly detailing experience with: {', '.join(missing[:3])}.")
    if not has_metrics:
        improvements.append("Quantify your achievements using the XYZ formula: 'Accomplished [X] as measured by [Y] by doing [Z]'.")
    improvements.append("Ensure your summary section explicitly mentions your target role: " + payload.target_role)
    
    projects = [
        "Production-ready CRUD application with authentication, Dockerfile, and CI/CD GitHub Action",
        "Interactive dashboard consuming public datasets with client-side filters and responsive charts",
        "Benchmark report comparing baseline models against CatBoost/XGBoost on tabular datasets"
    ]
    
    summary = f"Your resume demonstrates solid fundamentals for {payload.target_role}. Integrating the recommended keywords and quantifiable outcomes will elevate your ATS ranking."
    
    return ResumeReviewResponse(
        ats_score=score,
        strengths=strengths,
        improvements=improvements,
        missing_keywords=missing,
        recommended_projects=projects,
        summary_verdict=summary
    )

@router.get("/applications", response_model=List[JobApplicationResponse])
def get_user_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(JobApplication).filter(JobApplication.user_id == current_user.id).order_by(JobApplication.created_at.desc()).all()

@router.post("/applications", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_job_application(payload: JobApplicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app_item = JobApplication(
        user_id=current_user.id,
        company=payload.company.strip(),
        role_title=payload.role_title.strip(),
        status=payload.status,
        deadline=payload.deadline,
        notes=payload.notes
    )
    db.add(app_item)
    db.commit()
    db.refresh(app_item)
    return app_item

@router.put("/applications/{app_id}", response_model=JobApplicationResponse)
def update_job_application(app_id: int, payload: JobApplicationUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app_item = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not app_item:
        raise HTTPException(status_code=404, detail="Job application not found or access denied.")
        
    if payload.status is not None:
        app_item.status = payload.status
    if payload.deadline is not None:
        app_item.deadline = payload.deadline
    if payload.notes is not None:
        app_item.notes = payload.notes
        
    db.commit()
    db.refresh(app_item)
    return app_item

@router.delete("/applications/{app_id}")
def delete_job_application(app_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app_item = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not app_item:
        raise HTTPException(status_code=404, detail="Job application not found or access denied.")
    db.delete(app_item)
    db.commit()
    return {"message": "Application deleted successfully."}
