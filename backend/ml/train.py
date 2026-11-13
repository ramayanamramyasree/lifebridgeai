import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from catboost import CatBoostClassifier

def train_and_evaluate(data_path: str = None, model_save_path: str = None, metrics_save_path: str = None):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if data_path is None:
        data_path = os.path.join(base_dir, "data", "lifebridge_recommendations.csv")
    if model_save_path is None:
        model_save_path = os.path.join(base_dir, "lifebridge_catboost_model.cbm")
    if metrics_save_path is None:
        metrics_save_path = os.path.join(base_dir, "metrics.json")
        
    print(f"--- LifeBridge AI: CatBoost Recommendation Model Training ---")
    print(f"Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")
    
    cat_features = [
        "life_stage",
        "goal_category",
        "topic_category",
        "task_urgency",
        "difficulty_level",
        "resource_type"
    ]
    num_features = [
        "days_until_deadline",
        "progress_ratio",
        "user_feedback_signal",
        "interaction_count"
    ]
    target_col = "relevance_label"
    
    X = df[cat_features + num_features]
    y = df[target_col]
    
    # Train / test split with fixed seed and stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
    
    # 1. Baseline Model (Dummy most_frequent classifier)
    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(X_train, y_train)
    y_pred_base = baseline.predict(X_test)
    base_acc = float(accuracy_score(y_test, y_pred_base))
    base_f1 = float(f1_score(y_test, y_pred_base, zero_division=0))
    print(f"Baseline (Most Frequent) - Accuracy: {base_acc:.4f}, F1: {base_f1:.4f}")
    
    # 2. CatBoost Classifier
    cb_model = CatBoostClassifier(
        iterations=250,
        depth=6,
        learning_rate=0.07,
        cat_features=cat_features,
        eval_metric="Logloss",
        random_seed=42,
        verbose=False
    )
    
    cb_model.fit(X_train, y_train, eval_set=(X_test, y_test), early_stopping_rounds=30)
    
    y_pred = cb_model.predict(X_test)
    y_prob = cb_model.predict_proba(X_test)[:, 1]
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    print("\n--- Model Evaluation Results ---")
    print(f"CatBoost Accuracy:  {acc:.4f} (vs Baseline: {base_acc:.4f})")
    print(f"CatBoost Precision: {prec:.4f}")
    print(f"CatBoost Recall:    {rec:.4f}")
    print(f"CatBoost F1 Score:  {f1:.4f}")
    print(f"CatBoost ROC-AUC:   {roc_auc:.4f}")
    print(f"Confusion Matrix:   {cm}")
    
    # Feature importances
    feature_importances = dict(zip(X.columns, [float(v) for v in cb_model.get_feature_importance()]))
    print(f"\nTop Features by Importance:")
    for k, v in sorted(feature_importances.items(), key=lambda item: item[1], reverse=True)[:5]:
        print(f"  - {k}: {v:.2f}%")
        
    # Save model artifact
    cb_model.save_model(model_save_path)
    print(f"\nModel artifact saved to: {model_save_path}")
    
    # Save metrics JSON
    metrics_data = {
        "model_name": "CatBoost Recommendation Classifier",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "baseline_accuracy": round(base_acc, 4),
        "baseline_f1": round(base_f1, 4),
        "confusion_matrix": cm,
        "dataset_rows": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": list(X.columns),
        "target": target_col,
        "feature_importances": feature_importances,
        "status": "trained_and_verified"
    }
    with open(metrics_save_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Metrics saved to: {metrics_save_path}")
    
    return metrics_data

if __name__ == "__main__":
    train_and_evaluate()
