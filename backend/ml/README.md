# LifeBridge AI: CatBoost Machine Learning Pipeline

## Overview
LifeBridge AI uses a dedicated, reproducible machine learning workflow built with **CatBoost** to rank personalized next actions in **Life Radar**. 

CatBoost is utilized strictly for its ideal tabular classification and ranking strengths: handling heterogeneous categorical features, non-linear feature interactions, and avoiding target leakage. Natural language generation and conversational assistance are decoupled into the AI assistant module.

## Dataset Specification
- **Path**: `backend/ml/data/lifebridge_recommendations.csv`
- **Rows**: 1,200 synthetic rows generated via `backend/ml/data/dataset_generator.py`
- **Data Provenance**: Purely synthetic simulation modeling real user lifecycle attributes (task urgency, upcoming deadlines, topic alignment, feedback ratings, progress ratios). Contains zero personally identifiable information (PII) or sensitive health records.

### Feature Schema
| Feature | Type | Description |
|---|---|---|
| `life_stage` | Categorical | `student`, `job_seeker`, `family`, `older_adult` |
| `goal_category` | Categorical | `exam_prep`, `career_switch`, `health_routine`, `skill_upskilling`, etc. |
| `topic_category` | Categorical | `computer_science`, `aptitude_reasoning`, `interview_prep`, `wellbeing_reminder`, etc. |
| `task_urgency` | Categorical | `low`, `medium`, `high`, `critical` |
| `difficulty_level` | Categorical | `beginner`, `intermediate`, `advanced` |
| `resource_type` | Categorical | `concept_guide`, `quiz_practice`, `mock_interview`, `medication_schedule`, `checklist` |
| `days_until_deadline` | Numerical (int) | Number of days until target milestone or task expiration |
| `progress_ratio` | Numerical (float) | Historical task/topic completion proportion (0.0 to 1.0) |
| `user_feedback_signal` | Numerical (float) | Average user rating on previous recommendations (1.0 to 5.0) |
| `interaction_count` | Numerical (int) | Number of recent activity sessions |
| **`relevance_label`** | **Binary Target** | `1` if candidate next-action is high priority / relevant, `0` otherwise |

## Model Architecture & Evaluation
- **Split**: 80% Train (960 samples), 20% Stratified Test (240 samples), Seed 42.
- **Baseline**: Most-Frequent Dummy Classifier
  - Baseline Accuracy: **0.6625** (F1: 0.0000)
- **CatBoost Classifier**:
  - Iterations: 250, Depth: 6, Learning Rate: 0.07, Eval Metric: Logloss
  - **Accuracy**: **0.8625** (+20.0% improvement over baseline)
  - **Precision**: **0.8243**
  - **Recall**: **0.7531**
  - **F1 Score**: **0.7871**
  - **ROC-AUC**: **0.9441**
  - **Confusion Matrix**: `[[146, 13], [20, 61]]`

## How to Reproduce
Run the following commands:
```bash
# 1. Generate or regenerate dataset
python -m backend.ml.data.dataset_generator

# 2. Train, evaluate, and save model
python -m backend.ml.train
```

The resulting model is saved to `backend/ml/lifebridge_catboost_model.cbm` and loaded seamlessly by `backend/ml/inference.py`.
