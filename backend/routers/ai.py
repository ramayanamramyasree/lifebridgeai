import os
from typing import List, Optional
from fastapi import APIRouter, Depends
from backend.models import User
from backend.schemas import AIChatRequest, AIChatResponse
from backend.auth import get_current_user
from backend.config import settings

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

LOCAL_KNOWLEDGE_BASE = {
    "big-o": (
        "Big-O notation specifies the asymptotic upper bound on an algorithm's execution time or space as input n grows. "
        "Common bounds: O(1) constant, O(log n) logarithmic (binary search), O(n) linear, O(n log n) efficient sort, "
        "O(n^2) quadratic (nested comparisons). To analyze an algorithm, identify the dominant operation inside nested loops "
        "or write recurrence relations solved via the Master Theorem."
    ),
    "normalization": (
        "Database normalization is the disciplined decomposition of relational tables to eliminate insertion, update, and deletion anomalies. "
        "Key levels: 1NF requires atomic values; 2NF eliminates partial dependency on composite candidate keys; "
        "3NF eliminates transitive dependencies (non-key -> non-key); BCNF ensures that in every functional dependency X -> Y, X is a superkey."
    ),
    "resume": (
        "For an impactful technical resume: 1) Align job titles with the target role. 2) Format bullet points with Google's XYZ formula: "
        "'Accomplished [X] measured by [Y] by doing [Z]'. 3) List core skills upfront (e.g. FastAPI, Next.js, CatBoost, PostgreSQL). "
        "4) Ensure quantifiable impact (e.g., 'reduced API latency by 35%'). 5) Keep formatting clean and single-column for optimal ATS parsing."
    ),
    "interview": (
        "Technical interview strategy: 1) Clarify constraints, input ranges, and edge cases before coding. "
        "2) State brute-force approach first and analyze its complexity. 3) Propose optimized approaches (e.g., hash maps, two pointers, dynamic programming). "
        "4) Write clean, modular code with descriptive variable names. 5) Dry-run with an example input and verify edge cases (empty input, duplicates)."
    ),
    "medication": (
        "IMPORTANT MEDICAL SAFETY ADVICE: LifeBridge AI is not a clinician and does not prescribe, diagnose, or recommend dosage changes. "
        "Always follow your physician's prescribed instructions and take medications at designated intervals. If you experience adverse side effects, "
        "contact your healthcare provider or emergency medical services immediately."
    )
}

def generate_local_response(query: str, language: str) -> AIChatResponse:
    q = query.lower()
    reply = ""
    suggestions = []

    # Check for medical queries first to provide cautious safety guidance
    if any(k in q for k in ["medicine", "pill", "dose", "symptom", "pain", "prescribe", "treatment", "cure", "drug"]):
        reply = (
            "Medical Safety Notice: LifeBridge AI provides educational information and adherence tracking only. "
            "We cannot diagnose illnesses or prescribe medication dosages. Please consult a licensed medical clinician "
            "or your local healthcare provider for personal health concerns."
        )
        suggestions = ["How do I set up a medication reminder?", "Where can I view my scheduled routine?", "Find official health resources"]

    elif any(k in q for k in ["big-o", "time complexity", "space complexity", "algorithm", "complexity"]):
        reply = LOCAL_KNOWLEDGE_BASE["big-o"]
        suggestions = ["Give me a worked example of O(log n)", "Explain MergeSort vs QuickSort", "Take the Algorithms Quiz"]

    elif any(k in q for k in ["normalization", "database", "sql", "1nf", "2nf", "3nf", "bcnf", "acid"]):
        reply = LOCAL_KNOWLEDGE_BASE["normalization"]
        suggestions = ["What is the difference between 3NF and BCNF?", "Explain ACID transactions", "Solve SQL practice questions"]

    elif any(k in q for k in ["resume", "cv", "ats", "portfolio"]):
        reply = LOCAL_KNOWLEDGE_BASE["resume"]
        suggestions = ["Review my resume text", "Explore Software Engineer roadmap", "View sample portfolio projects"]

    elif any(k in q for k in ["interview", "technical round", "coding test", "behavioral"]):
        reply = LOCAL_KNOWLEDGE_BASE["interview"]
        suggestions = ["Practice Data Structure MCQs", "Prepare STAR method answers", "Explain System Design fundamentals"]

    elif any(k in q for k in ["lifebridge", "how does", "what is", "help", "platform"]):
        reply = (
            "LifeBridge AI is a unified platform supporting you across every life stage: "
            "1) Students: Searchable interactive learning hub and practice quiz mode. "
            "2) Job Seekers: ATS resume analysis, skill-gap roadmaps, and tracked job applications. "
            "3) Families & Older Adults: User-configured medication and appointment reminders with high-contrast accessibility. "
            "4) Life Radar: AI/CatBoost powered next-action recommendations tailored to your goals."
        )
        suggestions = ["How does Life Radar work?", "Search Learning Hub", "Check my Dashboard"]

    else:
        reply = (
            f"Here is structured guidance on '{query}': "
            "LifeBridge AI provides in-depth learning materials, practice quizzes, and career roadmaps. "
            "You can explore our Searchable Learning Hub for comprehensive breakdowns with key concepts and worked examples, "
            "or test your skills in the Practice Mode."
        )
        suggestions = ["Explore Learning Hub topics", "Take a Practice Quiz", "View Life Radar suggestions"]

    # Language support note
    if language == "hi":
        reply = f"[हिंदी सहायता] {reply}\n\n(LifeBridge AI आपकी अध्ययन और करियर प्रगति में सहायता के लिए हमेशा उपलब्ध है।)"
    elif language == "te":
        reply = f"[తెలుగు సహాయం] {reply}\n\n(LifeBridge AI మీ అభ్యాస మరియు కెరీర్ ప్రయాణంలో మీకు మార్గదర్శకత్వం వహిస్తుంది.)"

    return AIChatResponse(
        reply=reply,
        provider="LifeBridge Local Knowledge Engine (Deterministic & Safe Fallback)",
        suggestions=suggestions
    )

@router.post("/chat", response_model=AIChatResponse)
def chat_assistant(payload: AIChatRequest, current_user: User = Depends(get_current_user)):
    user_lang = payload.language or current_user.preferred_language or "en"
    
    # Check if Gemini API Key is configured in environment
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            system_prompt = (
                f"You are the LifeBridge AI Assistant. Current user life stage: {current_user.life_stage}. "
                f"Language preference: {user_lang}. "
                "Provide clear, constructive, educational, and structured answers. "
                "CRITICAL: If the user asks about medical diagnosis or prescriptions, include a strict disclaimer to consult a healthcare provider."
            )
            
            prompt = f"{system_prompt}\n\nUser Question: {payload.message}"
            res = model.generate_content(prompt)
            if res and res.text:
                return AIChatResponse(
                    reply=res.text.strip(),
                    provider="Google Gemini 1.5 Flash (Cloud AI)",
                    suggestions=["Ask another question", "Explore related topics in Learning Hub", "View Life Radar"]
                )
        except Exception as e:
            print(f"[AI Chat] Gemini API call failed or timed out: {e}. Falling back to local engine.")
            
    # Deterministic local fallback
    return generate_local_response(payload.message, user_lang)
