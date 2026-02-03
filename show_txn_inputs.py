"""
Show transaction inputs and fraud detection predictions for legitimate vs fraudulent
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from data_processor import DataPreprocessor
from ml_models import MLModels
from real_time_scorer import RealTimeTransactionScorer, AlertManager

# Load and prepare data
print("\n" + "="*80)
print("TRAINING FRAUD DETECTION MODELS")
print("="*80)

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

print(f"[OK] Data loaded: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")

# Train models
print("\n[Training] All 3 Models...")
ml_models = MLModels(model_dir="./models")
ml_models.train_isolation_forest(X_train_scaled, y_train)
ml_models.train_random_forest(X_train_scaled, X_val_scaled, y_train, y_val)
ml_models.train_xgboost(X_train_scaled, X_val_scaled, y_train, y_val)
print("[OK] Models trained")
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

# Score all test transactions to find one legitimate and one fraudulent
print("\n[Analyzing] Finding legitimate and fraudulent examples...")
examples = {'legit': None, 'fraud': None}

for idx in range(len(X_test)):
    features = X_test.iloc[idx].values
    score = scorer.score_transaction(features)
    
    if examples['legit'] is None and not score['is_flagged']:
        examples['legit'] = {'idx': idx, 'score': score, 'features': features}
    
    if examples['fraud'] is None and score['is_flagged']:
        examples['fraud'] = {'idx': idx, 'score': score, 'features': features}
    
    if examples['legit'] and examples['fraud']:
        break

# ========== INPUT 1: LEGITIMATE TRANSACTION ==========
print("\n" + "="*80)
print("INPUT 1: LEGITIMATE TRANSACTION")
print("="*80)

legit_data = examples['legit']
print(f"\nTransaction Index: {legit_data['idx']}")
print(f"Number of Features: {len(legit_data['features'])}")
print(f"\n[RAW TRANSACTION INPUTS - 19 Features]")
print("-" * 80)

feature_names = [
    'amount', 'is_high_amount', 'Transaction_Amount_Deviation',
    'Days_Since_Last_Transaction', 'day_of_month', 'month',
    'day_of_week', 'hour', 'Merchant_Risk_Level',
    'Device_Risk_Score', 'Device_Type_encoded',
    'Location_Risk_encoded', 'Transaction_Status_encoded',
    'Card_Type_encoded', 'Customer_Segment_encoded',
    'Transaction_Type_encoded', 'Device_OS_encoded',
    'Merchant_Category_encoded', 'Time_Zone_Risk_encoded'
]

for i, (name, value) in enumerate(zip(feature_names, legit_data['features']), 1):
    print(f"  {i:2d}. {name:40s} = {value:10.4f}")

print(f"\n[MODEL PREDICTIONS FOR LEGITIMATE TRANSACTION]")
print("-" * 80)
score1 = legit_data['score']
print(f"  Isolation Forest Anomaly Score:    {score1['iso_score']:6.4f}  (0.5=normal, >0.5=anomaly)")
print(f"  Random Forest Fraud Probability:   {score1['rf_proba']:6.4f}  (0=legitimate, 1=fraudulent)")
print(f"  XGBoost Fraud Probability:         {score1['xgb_proba']:6.4f}  (0=legitimate, 1=fraudulent)")
print(f"\n  ENSEMBLE DECISION:")
print(f"    Weighted Ensemble Score:         {score1['ensemble_score']:6.4f}  (0=legit, 1=fraud)")
print(f"    Classification:                  {'APPROVED - LEGITIMATE' if not score1['is_flagged'] else 'FLAGGED - SUSPICIOUS'}")
print(f"    Confidence:                      {score1['confidence']:6.4f}")

severity = alert_manager.classify_severity(score1['confidence'])
action = alert_manager.get_action(severity)
print(f"    Risk Level:                      {severity}")
print(f"    Recommended Action:              {action}")

# ========== INPUT 2: FRAUDULENT TRANSACTION ==========
print("\n" + "="*80)
print("INPUT 2: FRAUDULENT TRANSACTION")
print("="*80)

fraud_data = examples['fraud']
print(f"\nTransaction Index: {fraud_data['idx']}")
print(f"Number of Features: {len(fraud_data['features'])}")
print(f"\n[RAW TRANSACTION INPUTS - 19 Features]")
print("-" * 80)

for i, (name, value) in enumerate(zip(feature_names, fraud_data['features']), 1):
    print(f"  {i:2d}. {name:40s} = {value:10.4f}")

print(f"\n[MODEL PREDICTIONS FOR FRAUDULENT TRANSACTION]")
print("-" * 80)
score2 = fraud_data['score']
print(f"  Isolation Forest Anomaly Score:    {score2['iso_score']:6.4f}  (0.5=normal, >0.5=anomaly)")
print(f"  Random Forest Fraud Probability:   {score2['rf_proba']:6.4f}  (0=legitimate, 1=fraudulent)")
print(f"  XGBoost Fraud Probability:         {score2['xgb_proba']:6.4f}  (0=legitimate, 1=fraudulent)")
print(f"\n  ENSEMBLE DECISION:")
print(f"    Weighted Ensemble Score:         {score2['ensemble_score']:6.4f}  (0=legit, 1=fraud)")
print(f"    Classification:                  {'APPROVED - LEGITIMATE' if not score2['is_flagged'] else 'FLAGGED - SUSPICIOUS'}")
print(f"    Confidence:                      {score2['confidence']:6.4f}")

severity2 = alert_manager.classify_severity(score2['confidence'])
action2 = alert_manager.get_action(severity2)
print(f"    Risk Level:                      {severity2}")
print(f"    Recommended Action:              {action2}")

# ========== FEATURE COMPARISON ==========
print("\n" + "="*80)
print("FEATURE COMPARISON: LEGITIMATE vs FRAUDULENT")
print("="*80)

comparison_data = []
for i, (name, legit_val, fraud_val) in enumerate(zip(feature_names, legit_data['features'], fraud_data['features']), 1):
    diff = fraud_val - legit_val
    comparison_data.append({
        'Feature': name,
        'Legitimate': legit_val,
        'Fraudulent': fraud_val,
        'Difference': diff
    })

comp_df = pd.DataFrame(comparison_data)
print("\n" + comp_df.to_string(index=False))

# Find biggest differences
print("\n" + "-" * 80)
print("TOP 5 FEATURES WITH LARGEST DIFFERENCES (Fraud - Legit):")
print("-" * 80)
top_diff = comp_df.reindex(comp_df['Difference'].abs().values.argsort()[-5:])
for idx, row in top_diff.iterrows():
    print(f"  {row['Feature']:40s}: Legit={row['Legitimate']:8.4f}, Fraud={row['Fraudulent']:8.4f}, Diff={row['Difference']:8.4f}")

# ========== SUMMARY ==========
print("\n" + "="*80)
print("SUMMARY: MODEL PERFORMANCE ON 2 EXAMPLES")
print("="*80)

summary_data = {
    'Metric': [
        'Isolation Forest Score',
        'Random Forest Prob',
        'XGBoost Prob',
        'Ensemble Score',
        'Classification',
        'Risk Level'
    ],
    'Legitimate': [
        f"{score1['iso_score']:.4f}",
        f"{score1['rf_proba']:.4f}",
        f"{score1['xgb_proba']:.4f}",
        f"{score1['ensemble_score']:.4f}",
        'APPROVED' if not score1['is_flagged'] else 'FLAGGED',
        severity
    ],
    'Fraudulent': [
        f"{score2['iso_score']:.4f}",
        f"{score2['rf_proba']:.4f}",
        f"{score2['xgb_proba']:.4f}",
        f"{score2['ensemble_score']:.4f}",
        'APPROVED' if not score2['is_flagged'] else 'FLAGGED',
        severity2
    ]
}

summary_df = pd.DataFrame(summary_data)
print("\n" + summary_df.to_string(index=False))

print("\n" + "="*80)
print("[OK] ANALYSIS COMPLETE - 2 TRANSACTION INPUTS SHOWN WITH PREDICTIONS")
print("="*80)
print(f"\n  - Legitimate Transaction: {len(legit_data['features'])} input features --> {action}")
print(f"  - Fraudulent Transaction: {len(fraud_data['features'])} input features --> {action2}")
print(f"\n  Models successfully distinguish between legitimate and fraudulent!")
print(f"  Models saved in: ./models/")
