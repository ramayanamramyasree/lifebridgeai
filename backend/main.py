from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.seed_data import init_db_and_seed
from backend.routers import (
    auth,
    learning,
    practice,
    career,
    reminders,
    tasks,
    radar,
    ai,
    feedback,
    admin,
    cultural
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Unified life support platform for learning, career, wellbeing, and personalized next-actions.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows dev Next.js client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("[Startup] Initializing database and ensuring seed data / admin bootstrap...")
    init_db_and_seed()
    print("[Startup] LifeBridge AI backend is ready to accept requests.")

# Include routers
app.include_router(auth.router)
app.include_router(learning.router)
app.include_router(practice.router)
app.include_router(career.router)
app.include_router(reminders.router)
app.include_router(tasks.router)
app.include_router(radar.router)
app.include_router(ai.router)
app.include_router(feedback.router)
app.include_router(admin.router)
app.include_router(cultural.router)

@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": "One person. One platform. Support for every stage of life.",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to LifeBridge AI API",
        "health": "/api/health",
        "docs": "/docs"
    }
