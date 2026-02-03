"""
Financial Transaction Fraud Detection System
Main execution script for training and inference
"""

import sys
import os
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, confusion_matrix, classification_report
from datetime import datetime

# Import custom modules
from data_processor import DataPreprocessor
from ml_models import MLModels
from real_time_scorer import RealTimeTransactionScorer, AlertManager
from visualizations import VisualizationEngine


def main():
    print("\n" + "="*70)
    print("FINANCIAL TRANSACTION FRAUD DETECTION SYSTEM")
    print("Real-time Suspicious Activity Detection with 3 ML Models")
    print("="*70)
    
    # Configuration
    data_path = r"c:\Users\ringa\OneDrive\Desktop\project\new\Copy of Sample_DATA.csv"
    model_dir = "./fraud_detection_system/models"
    output_dir = "./fraud_detection_system/outputs"
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # ==================== STEP 1: DATA PREPROCESSING ====================
    print("\n[STEP 1] DATA PREPROCESSING & FEATURE ENGINEERING")
    print("-" * 70)
    
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
    
    # ==================== STEP 2: TRAIN ML MODELS ====================
    print("\n[STEP 2] TRAINING 3 ML MODELS")
    print("-" * 70)
    
    ml_models = MLModels(model_dir=model_dir)
    
    ml_models.train_isolation_forest(X_train_scaled, y_train)
    ml_models.train_random_forest(X_train_scaled, X_val_scaled, y_train, y_val)
    ml_models.train_xgboost(X_train_scaled, X_val_scaled, y_train, y_val)
    
    # ==================== STEP 3: EVALUATE MODELS ====================
    print("\n[STEP 3] MODEL EVALUATION")
    print("-" * 70)
    
    results_df = ml_models.evaluate_models(X_test_scaled, y_test, feature_cols)
    
    # ==================== STEP 4: VISUALIZATIONS ====================
    print("\n[STEP 4] GENERATING VISUALIZATIONS")
    print("-" * 70)
    
    viz_engine = VisualizationEngine(output_dir=output_dir)
    viz_engine.plot_eda(df_features)
    viz_engine.plot_model_comparison(ml_models.results, y_test)
    
    # ==================== STEP 5: REAL-TIME SCORING ====================
    print("\n[STEP 5] REAL-TIME TRANSACTION SCORING & FLAGGING")
    print("-" * 70)
    
    scorer = RealTimeTransactionScorer(
        iso_forest=ml_models.iso_forest,
        rf_model=ml_models.rf_model,
        xgb_model=ml_models.xgb_model,
        scaler=scaler,
        threshold=0.5
    )
    
    # Stream transactions through the system
    real_time_df = scorer.stream_transactions(X_test, y_test)
    
    print(f"\n[OK] Processed {len(real_time_df)} transactions in real-time mode")
    print(f"  Flagged Transactions: {real_time_df['flagged'].sum()}")
    print(f"  Actual Fraud Cases: {real_time_df['actual_fraud'].sum()}")
    print(f"  Detection Rate: {real_time_df['flagged'].mean()*100:.2f}%")
    print(f"  Real-time Accuracy: {(real_time_df['flagged'] == real_time_df['actual_fraud']).mean():.4f}")
    
    # Real-time visualization
    viz_engine.plot_realtime_results(real_time_df, y_test)
    
    # ==================== STEP 6: ENSEMBLE ANALYSIS ====================
    print("\n[STEP 6] ENSEMBLE & CONSENSUS ANALYSIS")
    print("-" * 70)
    
    # Weighted probability ensemble
    ensemble_proba_weighted = (0.3 * ml_models.results['rf_proba'] + 
                               0.7 * ml_models.results['xgb_proba'])
    ensemble_pred = (ensemble_proba_weighted >= 0.5).astype(int)
    
    ensemble_accuracy = (ensemble_pred == y_test).mean()
    ensemble_auc = roc_auc_score(y_test, ensemble_proba_weighted)
    
    print(f"Weighted Probability Ensemble (30% RF + 70% XGB):")
    print(f"  Accuracy: {ensemble_accuracy:.4f}")
    print(f"  ROC-AUC: {ensemble_auc:.4f}")
    print(f"\nConfusion Matrix:")
    print(confusion_matrix(y_test, ensemble_pred))
    
    # ==================== STEP 7: ALERT MANAGEMENT ====================
    print("\n[STEP 7] ALERT GENERATION & SEVERITY CLASSIFICATION")
    print("-" * 70)
    
    alert_manager = AlertManager(high_risk_threshold=0.8, medium_risk_threshold=0.6)
    
    # Generate alerts for flagged transactions
    flagged_idx = real_time_df[real_time_df['flagged']==1].index.tolist()
    high_alerts = 0
    medium_alerts = 0
    
    for idx in flagged_idx[:10]:  # Show first 10 flagged
        confidence = real_time_df.loc[idx, 'confidence']
        severity = alert_manager.classify_severity(confidence)
        if severity == 'HIGH':
            high_alerts += 1
        elif severity == 'MEDIUM':
            medium_alerts += 1
    
    print(f"Alert Summary (from first 10 flagged transactions):")
    print(f"  High Risk Alerts: {high_alerts}")
    print(f"  Medium Risk Alerts: {medium_alerts}")
    
    # ==================== STEP 8: SAVE MODELS & REPORT ====================
    print("\n[STEP 8] SAVING MODELS & GENERATING REPORT")
    print("-" * 70)
    
    ml_models.save_models()
    
    # Generate summary report
    report = f"""
FRAUD DETECTION SYSTEM - FINAL REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{"="*70}

DATASET OVERVIEW
{"-"*70}
Total Transactions: {len(df_features)}
Training Set: {len(X_train)} | Fraud Rate: {y_train.mean()*100:.2f}%
Validation Set: {len(X_val)} | Fraud Rate: {y_val.mean()*100:.2f}%
Test Set: {len(X_test)} | Fraud Rate: {y_test.mean()*100:.2f}%

🤖 🤖 MODEL PERFORMANCE (Test Set)
{"-"*70}
Isolation Forest:
  - Accuracy: {ml_models.results['iso_auc']:.4f}
  - ROC-AUC: {ml_models.results['iso_auc']:.4f}

Random Forest:
  - Accuracy: {ml_models.results['rf_auc']:.4f}
  - ROC-AUC: {ml_models.results['rf_auc']:.4f}

XGBoost:
  - Accuracy: {ml_models.results['xgb_auc']:.4f}
  - ROC-AUC: {ml_models.results['xgb_auc']:.4f}

ENSEMBLE MODEL
{"-"*70}
Weighted Probability Ensemble (30% RF + 70% XGB):
  - Accuracy: {ensemble_accuracy:.4f}
  - ROC-AUC: {ensemble_auc:.4f}

REAL-TIME DETECTION RESULTS
{"-"*70}
Transactions Processed: {len(real_time_df)}
Transactions Flagged: {real_time_df['flagged'].sum()}
True Positives: {((real_time_df['flagged']==1) & (real_time_df['actual_fraud']==1)).sum()}
False Positives: {((real_time_df['flagged']==1) & (real_time_df['actual_fraud']==0)).sum()}
False Negatives: {((real_time_df['flagged']==0) & (real_time_df['actual_fraud']==1)).sum()}

OUTPUT FILES
{"-"*70}
[OK] Models saved in: {model_dir}
[OK] Visualizations in: {output_dir}
[OK] Features count: {len(feature_cols)}

RECOMMENDATIONS
{"-"*70}
1. Use Weighted Probability Ensemble for production (best performance)
2. Set probability threshold at 0.5-0.6 for optimal performance
3. Monitor feature drift monthly using reference distributions
4. Retrain models quarterly with new labeled data
5. Implement real-time alert system for flagged transactions
6. Review false positives weekly to refine whitelist rules
7. Consider merchant risk and transaction amount in manual review

"""
    
    report_path = os.path.join(output_dir, "fraud_detection_report.txt")
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(report)
    print(f"\n[OK] Report saved to: {report_path}")
    
    # ==================== SUMMARY ====================
    print("\n" + "="*70)
    print("[OK] FRAUD DETECTION SYSTEM - SUCCESSFULLY COMPLETED")
    print("="*70)
    print(f"\nOutput files generated in: {output_dir}/")
    print(f"Models saved in: {model_dir}/")
    print("\nTo use for prediction:")
    print("  - Load models from models/ directory")
    print("  - Use RealTimeTransactionScorer for scoring")
    print("  - Use AlertManager for alert generation")


if __name__ == "__main__":
    main()
