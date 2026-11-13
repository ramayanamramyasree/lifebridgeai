import os
import json
import pytest
from backend.ml.data.dataset_generator import generate_recommendation_dataset
from backend.ml.train import train_and_evaluate
from backend.ml.inference import get_ml_predictor

def test_ml_dataset_generation():
    test_csv = "backend/ml/data/test_recommendations.csv"
    df = generate_recommendation_dataset(output_path=test_csv, num_samples=200, random_seed=42)
    assert len(df) == 200
    assert "relevance_label" in df.columns
    assert "life_stage" in df.columns
    if os.path.exists(test_csv):
        os.remove(test_csv)

def test_ml_training_and_metrics():
    metrics = train_and_evaluate()
    assert metrics["accuracy"] >= 0.70
    assert metrics["roc_auc"] >= 0.80
    assert metrics["accuracy"] > metrics["baseline_accuracy"]
    assert os.path.exists("backend/ml/lifebridge_catboost_model.cbm")
    assert os.path.exists("backend/ml/metrics.json")

def test_ml_inference_predictor():
    predictor = get_ml_predictor()
    features = {
        "life_stage": "student",
        "goal_category": "exam_prep",
        "topic_category": "computer_science",
        "task_urgency": "high",
        "difficulty_level": "intermediate",
        "resource_type": "quiz_practice",
        "days_until_deadline": 3,
        "progress_ratio": 0.3,
        "user_feedback_signal": 4.5,
        "interaction_count": 5
    }
    prob = predictor.predict_relevance(features)
    assert isinstance(prob, float)
    assert 0.0 <= prob <= 1.0
