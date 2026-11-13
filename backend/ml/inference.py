import os
import pandas as pd
from typing import Dict, Any, Optional
from catboost import CatBoostClassifier

class LifeRadarMLPredictor:
    _instance = None

    def __init__(self, model_path: Optional[str] = None):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        if model_path is None:
            model_path = os.path.join(base_dir, "lifebridge_catboost_model.cbm")
        self.model_path = model_path
        self.model: Optional[CatBoostClassifier] = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = CatBoostClassifier()
                self.model.load_model(self.model_path)
                print(f"[ML Inference] CatBoost model successfully loaded from {self.model_path}")
            except Exception as e:
                print(f"[ML Inference] Warning: Failed to load CatBoost model: {e}")
                self.model = None
        else:
            print(f"[ML Inference] Model file not found at {self.model_path}")
            self.model = None

    def predict_relevance(self, candidate_feature_dict: Dict[str, Any]) -> float:
        """
        Takes candidate feature dictionary and returns predicted probability of relevance (0.0 to 1.0).
        Fallback to rule-based prior if model is unavailable.
        """
        if self.model is None:
            # Rule-based fallback score
            return 0.75
            
        try:
            # Required feature order
            row_data = {
                "life_stage": [candidate_feature_dict.get("life_stage", "student")],
                "goal_category": [candidate_feature_dict.get("goal_category", "exam_prep")],
                "topic_category": [candidate_feature_dict.get("topic_category", "computer_science")],
                "task_urgency": [candidate_feature_dict.get("task_urgency", "medium")],
                "difficulty_level": [candidate_feature_dict.get("difficulty_level", "intermediate")],
                "resource_type": [candidate_feature_dict.get("resource_type", "concept_guide")],
                "days_until_deadline": [candidate_feature_dict.get("days_until_deadline", 7)],
                "progress_ratio": [candidate_feature_dict.get("progress_ratio", 0.5)],
                "user_feedback_signal": [candidate_feature_dict.get("user_feedback_signal", 4.0)],
                "interaction_count": [candidate_feature_dict.get("interaction_count", 3)]
            }
            df = pd.DataFrame(row_data)
            prob = float(self.model.predict_proba(df)[0][1])
            return prob
        except Exception as e:
            print(f"[ML Inference] Prediction error: {e}")
            return 0.70

_predictor_singleton = None

def get_ml_predictor() -> LifeRadarMLPredictor:
    global _predictor_singleton
    if _predictor_singleton is None:
        _predictor_singleton = LifeRadarMLPredictor()
    return _predictor_singleton
