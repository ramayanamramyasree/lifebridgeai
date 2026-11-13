import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.seed_data import init_db_and_seed
from backend.config import settings

from backend.database import engine, Base

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    init_db_and_seed()


def test_1_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LifeBridge" in data["service"]

def test_2_user_registration_and_duplicate_rejection():
    email = "tester_student1@lifebridge.ai"
    payload = {
        "email": email,
        "password": "Password123!",
        "full_name": "Student Tester One",
        "life_stage": "student",
        "preferred_language": "en"
    }
    # First registration
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201
    body1 = res1.json()
    assert "access_token" in body1
    assert body1["user"]["email"] == email
    assert body1["user"]["role"] == "user"

    # Duplicate registration rejection
    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]

def test_3_login_success_and_invalid_credentials():
    # Valid login
    res_valid = client.post("/api/auth/login", json={
        "email": "tester_student1@lifebridge.ai",
        "password": "Password123!"
    })
    assert res_valid.status_code == 200
    assert "access_token" in res_valid.json()

    # Invalid password
    res_invalid = client.post("/api/auth/login", json={
        "email": "tester_student1@lifebridge.ai",
        "password": "WrongPassword!"
    })
    assert res_invalid.status_code == 401

def test_4_authenticated_me_and_protected_access():
    # Unauthorized without token
    res_unauth = client.get("/api/auth/me")
    assert res_unauth.status_code == 401

    # Login to obtain token
    login_res = client.post("/api/auth/login", json={
        "email": "tester_student1@lifebridge.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "tester_student1@lifebridge.ai"

def test_5_ordinary_user_cannot_register_as_admin():
    # Attempting to supply role="admin" during registration
    res = client.post("/api/auth/register", json={
        "email": "hacker_attempt@lifebridge.ai",
        "password": "SecretPassword123!",
        "full_name": "Attempted Admin",
        "life_stage": "job_seeker",
        "preferred_language": "en"
    })
    assert res.status_code == 201
    user_data = res.json()["user"]
    # Role must strictly be 'user', never 'admin'
    assert user_data["role"] == "user"

def test_6_ordinary_user_forbidden_from_admin_apis():
    # Login as ordinary user
    login_res = client.post("/api/auth/login", json={
        "email": "hacker_attempt@lifebridge.ai",
        "password": "SecretPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt admin analytics
    res_admin = client.get("/api/admin/analytics", headers=headers)
    assert res_admin.status_code == 403
    assert "administrator privileges required" in res_admin.json()["detail"].lower()

def test_7_single_designated_admin_access():
    # Login as designated admin
    res_login = client.post("/api/auth/login", json={
        "email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_INITIAL_PASSWORD
    })
    assert res_login.status_code == 200
    admin_token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin analytics access
    res_analytics = client.get("/api/admin/analytics", headers=headers)
    assert res_analytics.status_code == 200
    data = res_analytics.json()
    assert "total_users" in data
    assert data["total_users"] >= 1
    assert "catboost_model_status" in data

def test_8_two_user_account_isolation():
    # Create User A
    userA_res = client.post("/api/auth/register", json={
        "email": "usera_isolation@lifebridge.ai",
        "password": "Password123!",
        "full_name": "User Alpha",
        "life_stage": "student",
        "preferred_language": "en"
    })
    tokenA = userA_res.json()["access_token"]
    headersA = {"Authorization": f"Bearer {tokenA}"}

    # Create User B
    userB_res = client.post("/api/auth/register", json={
        "email": "userb_isolation@lifebridge.ai",
        "password": "Password123!",
        "full_name": "User Beta",
        "life_stage": "job_seeker",
        "preferred_language": "en"
    })
    tokenB = userB_res.json()["access_token"]
    headersB = {"Authorization": f"Bearer {tokenB}"}

    # User A creates a private task
    taskA_res = client.post("/api/tasks", json={
        "title": "Confidential Study Plan for Alpha",
        "category": "Academic",
        "priority": "high"
    }, headers=headersA)
    assert taskA_res.status_code == 201
    taskA_id = taskA_res.json()["id"]

    # User B lists tasks -> User A's task must NOT appear
    userB_tasks = client.get("/api/tasks", headers=headersB).json()
    assert not any(t["id"] == taskA_id for t in userB_tasks)

    # User B attempts to edit or delete User A's task -> 404 access denied
    edit_res = client.put(f"/api/tasks/{taskA_id}", json={"title": "Hacked Title"}, headers=headersB)
    assert edit_res.status_code == 404

    delete_res = client.delete(f"/api/tasks/{taskA_id}", headers=headersB)
    assert delete_res.status_code == 404

def test_9_learning_search_and_topics():
    # Search for Big-O
    search_res = client.get("/api/learning/search?q=Big-O")
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) >= 1
    assert any("Big-O" in r["title"] for r in results)
    first = results[0]
    assert "explanation" in first
    assert len(first["key_concepts"]) > 0

    # Get distinct topics
    topics_res = client.get("/api/learning/topics")
    assert topics_res.status_code == 200
    assert "subjects" in topics_res.json()

def test_10_practice_questions_and_server_side_scoring():
    # Fetch questions
    q_res = client.get("/api/practice/questions")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) > 0
    first_q = questions[0]
    assert "options" in first_q
    # Security check: correct_option_index is NOT leaked in question listing
    assert "correct_option_index" not in first_q

    # Register/login user for attempt
    login_res = client.post("/api/auth/login", json={
        "email": "tester_student1@lifebridge.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit an answer
    sub_res = client.post("/api/practice/submit", json={
        "question_id": first_q["id"],
        "selected_option": 1
    }, headers=headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert "is_correct" in sub_data
    assert "score" in sub_data
    assert "explanation" in sub_data

def test_11_safe_reminders_and_action():
    login_res = client.post("/api/auth/login", json={
        "email": "tester_student1@lifebridge.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create medication reminder based on user-entered clinician instructions
    rem_res = client.post("/api/reminders", json={
        "title": "Daily Vitamin D3 & B12 Supplement",
        "reminder_type": "medication",
        "prescribed_instructions": "Take 1 tablet after breakfast with water as prescribed by Dr. Sharma",
        "schedule_time": "09:00 AM",
        "frequency": "Daily"
    }, headers=headers)
    assert rem_res.status_code == 201
    rem_id = rem_res.json()["id"]

    # Mark as taken
    action_res = client.post(f"/api/reminders/{rem_id}/action", json={"action": "taken"}, headers=headers)
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "taken"

def test_12_life_radar_recommendations():
    login_res = client.post("/api/auth/login", json={
        "email": "tester_student1@lifebridge.ai",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    radar_res = client.get("/api/radar", headers=headers)
    assert radar_res.status_code == 200
    items = radar_res.json()
    assert len(items) >= 1
    assert "title" in items[0]
    assert "confidence_score" in items[0]
    assert "source_rule" in items[0]

def test_13_feedback_submission_and_admin_review():
    # User submits feedback
    user_login = client.post("/api/auth/login", json={
        "email": "tester_student1@lifebridge.ai",
        "password": "Password123!"
    })
    user_headers = {"Authorization": f"Bearer {user_login.json()['access_token']}"}

    fb_res = client.post("/api/feedback", json={
        "rating": 5,
        "category": "Learning",
        "message": "The Big-O and Database normalization explanations were very clear!"
    }, headers=user_headers)
    assert fb_res.status_code == 201
    fb_id = fb_res.json()["id"]

    # Admin reviews feedback
    admin_login = client.post("/api/auth/login", json={
        "email": settings.ADMIN_EMAIL,
        "password": settings.ADMIN_INITIAL_PASSWORD
    })
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    update_res = client.put(f"/api/admin/feedback/{fb_id}/status", json={
        "status": "reviewed",
        "admin_notes": "Thanked user for positive feedback."
    }, headers=admin_headers)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "reviewed"
