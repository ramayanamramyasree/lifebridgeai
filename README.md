# LifeBridge AI — One Platform for Life's Essential Needs

> **Tagline:** One person. One platform. Support for every stage of life.

LifeBridge AI is a unified, competition-quality AI platform designed to support individuals throughout their lifecycle:
- **Students & Academics:** Deep concept search with worked examples, prerequisites, and server-scored practice quizzes.
- **Job Seekers & Career Growth:** ATS resume audit, structured career roadmaps (SWE, AI/ML, Cybersecurity), and job application tracking.
- **Families & Older Adults:** Accessible high-contrast interface, user-configured medication & appointment reminders, and document expiry tracking.
- **Life Radar Engine:** Explainable personalized next-action recommendations powered by a trained **CatBoost machine learning model** (0.8625 accuracy, 0.9441 ROC-AUC) and behavioral urgency rules.
- **Single Designated Administrator:** Strictly secured console with zero privilege escalation from public registration and real-time database telemetry.
- **Multilingual Support:** Fully functional across English, Hindi, and Telugu.

---

## 1. Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.12.7)
- Node.js 18+ (Tested on Node v24.18.0)
- npm 9+

### Startup Commands

#### Terminal 1 — Start FastAPI Backend:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The API server and documentation will be accessible at:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/health`

#### Terminal 2 — Start Next.js Frontend:
```bash
cd frontend
npm run dev
```
The web application will be accessible at:
- **Web App:** `http://localhost:3000`

---

## 2. Environment Variables & Security Configuration

Create a `.env` file in the root directory (or use `.env.example` as a template):

```bash
# Server & Database
PROJECT_NAME="LifeBridge AI"
DATABASE_URL="sqlite:///./lifebridge.db"
JWT_SECRET="replace-with-a-secure-random-secret-key-for-production"

# Single Administrator Provisioning
ADMIN_EMAIL="admin@lifebridge.ai"
ADMIN_INITIAL_PASSWORD="LifeBridgeAdmin2026!"

# Optional AI Key (Decoupled with local deterministic fallback)
GEMINI_API_KEY=""
```

### Strict Single Administrator Security Model
1. **Public Registration Immunity:** The public registration endpoint (`/api/auth/register`) strictly sets `role="user"`. Any attempt to supply `role="admin"` in the request payload or query is unconditionally rejected.
2. **Designated Bootstrap:** The sole administrator account is provisioned idempotently upon startup based on `ADMIN_EMAIL`. Re-running startup will never create secondary admins.
3. **Admin Console Enforcement:** Non-admin users attempting to access `/api/admin/*` immediately receive an HTTP 403 Forbidden error.
4. **Convenient Demo Access:** Use the credentials `admin@lifebridge.ai` / `LifeBridgeAdmin2026!` or click "Fill Designated Admin Credentials (Demo)" on the Sign In page.

---

## 3. CatBoost Machine Learning Pipeline

LifeBridge AI incorporates a dedicated tabular machine learning pipeline using **CatBoost** for next-action recommendation ranking.

### Reproduction Commands
```bash
# 1. Generate or regenerate the synthetic dataset
python -m backend.ml.data.dataset_generator

# 2. Train, evaluate against baseline, and save model artifact
python -m backend.ml.train
```

### Measured Model Metrics
- **Dataset:** 1,200 rows across 10 tabular signals (`backend/ml/data/lifebridge_recommendations.csv`).
- **Baseline (Most-Frequent Dummy Classifier):**
  - Accuracy: `0.6625`
  - F1 Score: `0.0000`
- **CatBoost Classifier (Stratified Test Set, Seed 42):**
  - **Accuracy:** `0.8625` (+20.0% lift over baseline)
  - **ROC-AUC:** `0.9441`
  - **Precision:** `0.8243`
  - **Recall:** `0.7531`
  - **F1 Score:** `0.7871`
  - **Confusion Matrix:** `[[146, 13], [20, 61]]`
  - **Top Features:** `days_until_deadline` (19.10%), `topic_category` (18.81%), `life_stage` (16.17%).

---

## 4. Automated Testing

All 16 test suites covering API security, account isolation, and machine learning pass cleanly:

```bash
python -m pytest tests/ -v
```

### Verified Test Cases:
1. `test_1_health_check`: Root health endpoint verification.
2. `test_2_user_registration_and_duplicate_rejection`: Registration and duplicate email prevention.
3. `test_3_login_success_and_invalid_credentials`: Password hashing and authentication.
4. `test_4_authenticated_me_and_protected_access`: Bearer token authorization.
5. `test_5_ordinary_user_cannot_register_as_admin`: Immunity from privilege escalation.
6. `test_6_ordinary_user_forbidden_from_admin_apis`: Strict HTTP 403 enforcement.
7. `test_7_single_designated_admin_access`: Designated administrator permissions.
8. `test_8_two_user_account_isolation`: User Alpha and User Beta cannot access or mutate each other's private records.
9. `test_9_learning_search_and_topics`: Database search for concepts and worked examples.
10. `test_10_practice_questions_and_server_side_scoring`: Server-side answer validation without leaking answer keys.
11. `test_11_safe_reminders_and_action`: Clinician schedule adherence with mark-taken tracking.
12. `test_12_life_radar_recommendations`: ML inference integration with CatBoost scoring.
13. `test_13_feedback_submission_and_admin_review`: End-to-end feedback lifecycle.
14. `test_ml_dataset_generation`: Dataset schema and distribution verification.
15. `test_ml_training_and_metrics`: Model convergence and metric thresholds.
16. `test_ml_inference_predictor`: Single-candidate inference probability computation.

---

## 5. Clinical Safety & Medical Safety Disclosures
- LifeBridge AI does **not** prescribe drugs, diagnose health conditions, or compute medication dosages.
- All reminders represent user-entered schedules following clinician instructions.
- Clear disclosures and advisory notices are displayed across the interface.
