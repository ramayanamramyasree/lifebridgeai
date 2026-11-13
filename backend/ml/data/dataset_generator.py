import os
import pandas as pd
import numpy as np

def generate_recommendation_dataset(output_path: str = None, num_samples: int = 1200, random_seed: int = 42):
    """
    Generates synthetic dataset for LifeBridge AI Next-Action / Recommendation relevance classification.
    Data is purely synthetic and contains zero PII or private healthcare data.
    """
    np.random.seed(random_seed)
    
    life_stages = ["student", "job_seeker", "family", "older_adult"]
    goal_categories = ["exam_prep", "career_switch", "health_routine", "skill_upskilling", "task_completion", "appointment_adherence"]
    topic_categories = ["computer_science", "aptitude_reasoning", "interview_prep", "wellbeing_reminder", "document_renewal", "mathematics"]
    task_urgencies = ["low", "medium", "high", "critical"]
    difficulty_levels = ["beginner", "intermediate", "advanced"]
    resource_types = ["concept_guide", "quiz_practice", "mock_interview", "medication_schedule", "checklist"]
    
    data = []
    
    for _ in range(num_samples):
        stage = np.random.choice(life_stages)
        goal = np.random.choice(goal_categories)
        topic = np.random.choice(topic_categories)
        urgency = np.random.choice(task_urgencies)
        difficulty = np.random.choice(difficulty_levels)
        res_type = np.random.choice(resource_types)
        
        # Continuous and count signals
        days_until_deadline = int(np.random.exponential(scale=12)) + 1
        days_until_deadline = min(days_until_deadline, 60)
        progress_ratio = round(float(np.random.uniform(0.0, 1.0)), 2)
        interaction_count = int(np.random.poisson(lam=5))
        user_feedback_signal = round(float(np.random.uniform(1.0, 5.0)), 1)
        
        # Ground truth relevance score formula (combining domain logic + slight noise)
        relevance_score = 0.0
        
        # Life stage alignment
        if stage == "student" and topic in ["computer_science", "mathematics", "aptitude_reasoning"]:
            relevance_score += 1.8
        elif stage == "job_seeker" and topic in ["interview_prep", "aptitude_reasoning"]:
            relevance_score += 2.0
        elif stage in ["family", "older_adult"] and topic in ["wellbeing_reminder", "document_renewal"]:
            relevance_score += 2.2
            
        # Urgency & deadline alignment
        if urgency in ["high", "critical"] and days_until_deadline <= 5:
            relevance_score += 2.2
        elif days_until_deadline <= 2:
            relevance_score += 1.5
            
        # Progress and feedback correlation
        if progress_ratio < 0.6:
            relevance_score += 1.0 # high need for follow-up
        if user_feedback_signal >= 3.5:
            relevance_score += 0.8
        if interaction_count >= 3:
            relevance_score += 0.6
            
        # Noise
        noise = np.random.normal(0, 0.7)
        relevance_score += noise
        
        # Binary target: 1 if recommended next action is highly relevant, 0 otherwise
        relevance_label = 1 if relevance_score >= 3.4 else 0
        
        data.append({
            "life_stage": stage,
            "goal_category": goal,
            "topic_category": topic,
            "task_urgency": urgency,
            "days_until_deadline": days_until_deadline,
            "progress_ratio": progress_ratio,
            "difficulty_level": difficulty,
            "resource_type": res_type,
            "user_feedback_signal": user_feedback_signal,
            "interaction_count": interaction_count,
            "relevance_label": relevance_label
        })
        
    df = pd.DataFrame(data)
    
    if output_path is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(base_dir, "lifebridge_recommendations.csv")
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} samples saved to {output_path}")
    print(f"Target distribution:\n{df['relevance_label'].value_counts(normalize=True)}")
    return df

if __name__ == "__main__":
    generate_recommendation_dataset()
