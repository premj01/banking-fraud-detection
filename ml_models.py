import numpy as np
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import roc_auc_score, confusion_matrix, classification_report, roc_curve
from xgboost import XGBClassifier

class MLModels:
    """Train and evaluate 3 fraud detection models"""
    
    def __init__(self, model_dir='./models'):
        self.model_dir = model_dir
        os.makedirs(model_dir, exist_ok=True)
        
        self.iso_forest = None
        self.rf_model = None
        self.xgb_model = None
        self.results = {}
    
    def train_isolation_forest(self, X_train_scaled, y_train):
        """Model 1: Isolation Forest (Unsupervised Anomaly Detection)"""
        print("\n" + "="*60)
        print("MODEL 1: ISOLATION FOREST")
        print("="*60)
        
        self.iso_forest = IsolationForest(
            contamination=y_train.mean(),
            random_state=42,
            n_jobs=-1
        )
        
        self.iso_forest.fit(X_train_scaled)
        print("[OK] Isolation Forest trained")
        return self.iso_forest
    
    def train_random_forest(self, X_train_scaled, X_val_scaled, y_train, y_val):
        """Model 2: Random Forest Classifier"""
        print("\n" + "="*60)
        print("MODEL 2: RANDOM FOREST CLASSIFIER")
        print("="*60)
        
        self.rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_split=10,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        
        self.rf_model.fit(X_train_scaled, y_train)
        print("[OK] Random Forest trained")
        return self.rf_model
    
    def train_xgboost(self, X_train_scaled, X_val_scaled, y_train, y_val):
        """Model 3: XGBoost Classifier"""
        print("\n" + "="*60)
        print("MODEL 3: XGBOOST CLASSIFIER")
        print("="*60)
        
        scale_pos_weight = len(y_train[y_train==0]) / len(y_train[y_train==1])
        
        self.xgb_model = XGBClassifier(
            n_estimators=100,
            max_depth=7,
            learning_rate=0.1,
            scale_pos_weight=scale_pos_weight,
            random_state=42,
            eval_metric='logloss',
            verbosity=0
        )
        
        self.xgb_model.fit(
            X_train_scaled, y_train,
            eval_set=[(X_val_scaled, y_val)],
            verbose=False
        )
        print("[OK] XGBoost trained")
        return self.xgb_model
    
    def evaluate_models(self, X_test_scaled, y_test, feature_cols):
        """Evaluate all 3 models"""
        print("\n" + "="*60)
        print("MODEL EVALUATION - TEST SET")
        print("="*60)
        
        # Isolation Forest predictions
        iso_pred = (self.iso_forest.predict(X_test_scaled) == -1).astype(int)
        iso_scores = -self.iso_forest.score_samples(X_test_scaled)
        iso_auc = roc_auc_score(y_test, iso_scores)
        
        # Random Forest predictions
        rf_pred = self.rf_model.predict(X_test_scaled)
        rf_proba = self.rf_model.predict_proba(X_test_scaled)[:, 1]
        rf_auc = roc_auc_score(y_test, rf_proba)
        
        # XGBoost predictions
        xgb_pred = self.xgb_model.predict(X_test_scaled)
        xgb_proba = self.xgb_model.predict_proba(X_test_scaled)[:, 1]
        xgb_auc = roc_auc_score(y_test, xgb_proba)
        
        results_df = pd.DataFrame({
            'Model': ['Isolation Forest', 'Random Forest', 'XGBoost'],
            'Accuracy': [
                (iso_pred == y_test).mean(),
                (rf_pred == y_test).mean(),
                (xgb_pred == y_test).mean()
            ],
            'ROC-AUC': [iso_auc, rf_auc, xgb_auc]
        })
        
        print("\nPerformance Comparison:")
        print(results_df.to_string(index=False))
        
        # Feature importance
        print("\n\nTop 10 Features - Random Forest:")
        rf_importance = pd.DataFrame({
            'feature': feature_cols,
            'importance': self.rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        print(rf_importance.head(10).to_string(index=False))
        
        print("\n\nTop 10 Features - XGBoost:")
        xgb_importance = pd.DataFrame({
            'feature': feature_cols,
            'importance': self.xgb_model.feature_importances_
        }).sort_values('importance', ascending=False)
        print(xgb_importance.head(10).to_string(index=False))
        
        self.results = {
            'iso_pred': iso_pred,
            'iso_scores': iso_scores,
            'iso_auc': iso_auc,
            'rf_pred': rf_pred,
            'rf_proba': rf_proba,
            'rf_auc': rf_auc,
            'xgb_pred': xgb_pred,
            'xgb_proba': xgb_proba,
            'xgb_auc': xgb_auc,
            'rf_importance': rf_importance,
            'xgb_importance': xgb_importance
        }
        
        return results_df
    
    def save_models(self):
        """Save trained models"""
        joblib.dump(self.iso_forest, os.path.join(self.model_dir, 'isolation_forest.pkl'))
        joblib.dump(self.rf_model, os.path.join(self.model_dir, 'random_forest.pkl'))
        joblib.dump(self.xgb_model, os.path.join(self.model_dir, 'xgboost.pkl'))
        print(f"\n[OK] Models saved to {self.model_dir}")
    
    def load_models(self):
        """Load trained models"""
        self.iso_forest = joblib.load(os.path.join(self.model_dir, 'isolation_forest.pkl'))
        self.rf_model = joblib.load(os.path.join(self.model_dir, 'random_forest.pkl'))
        self.xgb_model = joblib.load(os.path.join(self.model_dir, 'xgboost.pkl'))
        print("[OK] Models loaded successfully")
