"""
Apply trained fraud detection models to example transactions
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from data_processor import DataPreprocessor
from ml_models import MLModels
from real_time_scorer import RealTimeTransactionScorer, AlertManager

# Load and prepare data
print("\n" + "="*70)
print("TRAINING FRAUD DETECTION MODELS")
print("="*70)

data_path = r"c:\Users\ringa\OneDrive\Desktop\project\new\Copy of Sample_DATA.csv"
preprocessor = DataPreprocessor(data_path)
preprocessor.load_data()
preprocessor.clean_data()
df_features, feature_cols = preprocessor.engineer_features()

data_split = preprocessor.prepare_features()
X_train, y_train = data_split['X_train'], data_split['y_train']
X_val, y_val = data_split['X_val'], data_split['y_val']
X_test, y_test = data_split['X_test'], data_split['y_test']
X_train_scaled = data_split['X_train_scaled']
X_val_scaled = data_split['X_val_scaled']
X_test_scaled = data_split['X_test_scaled']
scaler = data_split['scaler']

# Train models
print("\n[Training] Isolation Forest...")
ml_models = MLModels(model_dir="./models")
ml_models.train_isolation_forest(X_train_scaled, y_train)

print("[Training] Random Forest...")
ml_models.train_random_forest(X_train_scaled, X_val_scaled, y_train, y_val)

print("[Training] XGBoost...")
ml_models.train_xgboost(X_train_scaled, X_val_scaled, y_train, y_val)

print("[OK] All models trained successfully")

# Save models
ml_models.save_models()

# Initialize real-time scorer
scorer = RealTimeTransactionScorer(
    iso_forest=ml_models.iso_forest,
    rf_model=ml_models.rf_model,
    xgb_model=ml_models.xgb_model,
    scaler=scaler,
    threshold=0.5
)

alert_manager = AlertManager()

# ========== EXAMPLE 1: Legitimate Transaction ==========
print("\n" + "="*70)
print("EXAMPLE 1: LEGITIMATE TRANSACTION")
print("="*70)

example1_features = X_test.iloc[0].values
scores1 = scorer.score_transaction(example1_features)

print(f"Transaction Features: {len(example1_features)} dimensions")
print(f"\nModel Scores:")
print(f"  Isolation Forest Score:  {scores1['iso_score']:.4f}")
print(f"  Random Forest Probability:  {scores1['rf_proba']:.4f}")
print(f"  XGBoost Probability:     {scores1['xgb_proba']:.4f}")
print(f"  Ensemble Score:          {scores1['ensemble_score']:.4f}")
print(f"\nDecision:")
print(f"  Flagged: {'YES - SUSPICIOUS' if scores1['is_flagged'] else 'NO - LEGITIMATE'}")
print(f"  Confidence: {scores1['confidence']:.4f}")

severity1 = alert_manager.classify_severity(scores1['confidence'])
action1 = alert_manager.get_action(severity1)
print(f"  Alert Severity: {severity1}")
print(f"  Recommended Action: {action1}")

# ========== EXAMPLE 2: Suspicious Transaction ==========
print("\n" + "="*70)
print("EXAMPLE 2: SUSPICIOUS TRANSACTION (High Amount)")
print("="*70)

example2_features = X_test.iloc[15].values
scores2 = scorer.score_transaction(example2_features)

print(f"Transaction Features: {len(example2_features)} dimensions")
print(f"\nModel Scores:")
print(f"  Isolation Forest Score:  {scores2['iso_score']:.4f}")
print(f"  Random Forest Probability:  {scores2['rf_proba']:.4f}")
print(f"  XGBoost Probability:     {scores2['xgb_proba']:.4f}")
print(f"  Ensemble Score:          {scores2['ensemble_score']:.4f}")
print(f"\nDecision:")
print(f"  Flagged: {'YES - SUSPICIOUS' if scores2['is_flagged'] else 'NO - LEGITIMATE'}")
print(f"  Confidence: {scores2['confidence']:.4f}")

severity2 = alert_manager.classify_severity(scores2['confidence'])
action2 = alert_manager.get_action(severity2)
print(f"  Alert Severity: {severity2}")
print(f"  Recommended Action: {action2}")

# ========== EXAMPLE 3: Another Transaction ==========
print("\n" + "="*70)
print("EXAMPLE 3: EDGE CASE TRANSACTION")
print("="*70)

example3_features = X_test.iloc[30].values
scores3 = scorer.score_transaction(example3_features)

print(f"Transaction Features: {len(example3_features)} dimensions")
print(f"\nModel Scores:")
print(f"  Isolation Forest Score:  {scores3['iso_score']:.4f}")
print(f"  Random Forest Probability:  {scores3['rf_proba']:.4f}")
print(f"  XGBoost Probability:     {scores3['xgb_proba']:.4f}")
print(f"  Ensemble Score:          {scores3['ensemble_score']:.4f}")
print(f"\nDecision:")
print(f"  Flagged: {'YES - SUSPICIOUS' if scores3['is_flagged'] else 'NO - LEGITIMATE'}")
print(f"  Confidence: {scores3['confidence']:.4f}")

severity3 = alert_manager.classify_severity(scores3['confidence'])
action3 = alert_manager.get_action(severity3)
print(f"  Alert Severity: {severity3}")
print(f"  Recommended Action: {action3}")

# ========== SUMMARY ==========
print("\n" + "="*70)
print("SUMMARY: 3 EXAMPLE TRANSACTIONS")
print("="*70)

summary_df = pd.DataFrame({
    'Transaction': ['Example 1 (Legit)', 'Example 2 (High Amt)', 'Example 3 (Edge)'],
    'Ensemble_Score': [scores1['ensemble_score'], scores2['ensemble_score'], scores3['ensemble_score']],
    'Is_Flagged': [scores1['is_flagged'], scores2['is_flagged'], scores3['is_flagged']],
    'RF_Prob': [scores1['rf_proba'], scores2['rf_proba'], scores3['rf_proba']],
    'XGB_Prob': [scores1['xgb_proba'], scores2['xgb_proba'], scores3['xgb_proba']],
    'Confidence': [scores1['confidence'], scores2['confidence'], scores3['confidence']]
})

print("\n" + summary_df.to_string(index=False))

print("\n" + "="*70)
print("[OK] PREDICTION COMPLETE - MODELS TRAINED & APPLIED TO 3 TRANSACTIONS")
print("="*70)
print("\nModels saved in: ./models/")
print("Ready for production use!")
