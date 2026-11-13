# Speaker Notes for LifeBridge AI Presentation

## Slide 1 – Title Slide
Introduce the project name **LifeBridge AI** and the tagline *One Person. One Platform. Support for Every Stage of Life.* Briefly state the purpose: a unified platform serving users across different life stages. Mention team members, department, guide, and academic year.

## Slide 2 – Introduction & Problem Statement
Explain how users currently juggle multiple fragmented apps for education, career, family, and daily tasks. Highlight the lack of a single adaptive experience and the need for a unified platform.

## Slide 3 – Proposed Solution & Objectives
Present LifeBridge AI as an AI‑enabled platform that adapts its UI based on the stored **life_stage**. List the core objectives: personalized dashboards, multilingual support, strong authentication, and stage‑specific features.

## Slide 4 – Life‑Stage Based Dashboards
Walk through the seven user categories (School Student, College Student, Job Seeker, Employee, Parent/Caregiver, Older Adult, Other). For each, mention the key modules shown on its dashboard. Emphasize that the backend stores the `life_stage` field in the **User** table and drives UI selection.

## Slide 5 – Core Features & Modules
Briefly describe each functional module (Life Radar, My Tasks, Learning Hub, Career Hub, Family & Care, Essential Services, AI Chatbot, Spiritual Learning, Privacy & Settings, Feedback). Note that modules appear only for relevant life stages.

## Slide 6 – System Architecture
Describe the request flow: Browser → **Next.js/React** frontend → **FastAPI** backend (JWT‑protected) → **SQLite** database via **SQLAlchemy**. Mention the CatBoost model invoked from `backend/ml` for recommendations. Point out where authentication, API endpoints, and data access occur.

## Slide 7 – Frontend Technologies – What, Why, Where
Explain each listed technology and its role, referencing actual files:
- **React** – reusable UI components (e.g., `Navbar.tsx`, dashboard cards).
- **Next.js** – routing and server‑side rendering (`pages/api/*`).
- **TypeScript** – type safety in components and API calls.
- **Tailwind CSS** – utility‑first styling (responsive layout).
- **lucide-react** – icon library used throughout the UI.
All are declared in `frontend/package.json`.

## Slide 8 – Backend Technologies – What, Why, Where
Cover each backend library and where it lives:
- **FastAPI** – API implementation (`backend/main.py`).
- **Uvicorn** – ASGI server (`uvicorn` command).
- **Pydantic** – request/response models (`backend/schemas.py`).
- **SQLAlchemy** – ORM mapping (`backend/models.py`).
- **python‑jose & JWT** – token handling (`backend/auth.py`).
- **bcrypt** – password hashing (`backend/auth.py`).
- **CatBoost** – recommendation engine (`backend/ml/*.py`).
- **scikit‑learn, pandas, numpy** – data prep for ML pipeline.
All versions are listed in `requirements.txt`.

## Slide 9 – Database & Data Management
State that the project uses **SQLite** (`lifebridge.db`) via **SQLAlchemy**. Summarize key tables (users, tasks, reminders, learning_resources, practice_questions, practice_attempts, feedbacks, job_applications, scripture_chapters, scripture_passages, puranic_stories) and their relationships (one‑to‑many from User). Show the ER diagram placeholder and explain why a relational DB fits the prototype.

## Slide 10 – AI Integration & Intelligent Features
Distinguish implemented AI from proposed:
- **Implemented**: CatBoost model for personalized recommendations (Life Radar).
- **Proposed**: LLM‑based chatbot using Gemini API (enabled when `GEMINI_API_KEY` is set).
- Content‑grounded answers for spiritual domain draw from `scripture_chapters` and `scripture_passages` tables.
Explain the workflow diagram (User → intent processing → content retrieval → response generation) and label the LLM step as *proposed*.

## Slide 11 – Security, Advantages & Future Scope
List security measures: bcrypt hashing, JWT auth, role‑based admin, environment‑based secrets. Highlight advantages of a unified, personalized platform. Outline future enhancements (full LLM integration, vector DB for semantic search, mobile app, external service APIs, richer analytics).

## Slide 12 – Conclusion & Demo
Recap the vision: a single adaptive ecosystem serving every life stage. Emphasize the modular stack, AI‑assisted guidance, and multilingual support. Invite questions and mention that a live demo (login → dashboard) will follow.
