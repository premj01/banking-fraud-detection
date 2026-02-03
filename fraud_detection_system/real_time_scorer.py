import numpy as np
import pandas as pd
from datetime import datetime

class RealTimeTransactionScorer:
    """Real-time fraud detection with ensemble voting"""
    
    def __init__(self, iso_forest, rf_model, xgb_model, scaler, threshold=0.5):
        self.iso_forest = iso_forest
        self.rf_model = rf_model
        self.xgb_model = xgb_model
        self.scaler = scaler
        self.threshold = threshold
        self.flagged_transactions = []
    
    def score_transaction(self, transaction_features):
        """Score a single transaction using ensemble approach"""
        
        # Scale features
        features_scaled = self.scaler.transform(transaction_features.reshape(1, -1))
        
        # Model 1: Isolation Forest (anomaly score)
        iso_score = -self.iso_forest.score_samples(features_scaled)[0]
        iso_pred = (iso_score > 0.5).astype(int)
        
        # Model 2: Random Forest (probability)
        rf_proba = self.rf_model.predict_proba(features_scaled)[0, 1]
        rf_pred = (rf_proba >= self.threshold).astype(int)
        
        # Model 3: XGBoost (probability)
        xgb_proba = self.xgb_model.predict_proba(features_scaled)[0, 1]
        xgb_pred = (xgb_proba >= self.threshold).astype(int)
        
        # Ensemble: consensus voting
        ensemble_score = (iso_pred + rf_pred + xgb_pred) / 3
        ensemble_pred = int(ensemble_score >= 0.66)  # Flag if 2+ models agree
        
        return {
            'iso_score': iso_score,
            'rf_proba': rf_proba,
            'xgb_proba': xgb_proba,
            'ensemble_score': ensemble_score,
            'is_flagged': ensemble_pred,
            'confidence': max(iso_score, rf_proba, xgb_proba)
        }
    
    def flag_suspicious_transaction(self, transaction_id, features, scores):
        """Log flagged transaction for review"""
        flag_record = {
            'timestamp': datetime.now(),
            'transaction_id': transaction_id,
            'iso_score': scores['iso_score'],
            'rf_proba': scores['rf_proba'],
            'xgb_proba': scores['xgb_proba'],
            'ensemble_score': scores['ensemble_score'],
            'confidence': scores['confidence'],
            'action': 'FLAG_FOR_REVIEW'
        }
        self.flagged_transactions.append(flag_record)
        return flag_record
    
    def stream_transactions(self, X_data, y_data, transaction_ids=None):
        """Process transactions in real-time streaming mode"""
        results = []
        
        for idx, (i, row) in enumerate(X_data.iterrows()):
            features = row.values
            scores = self.score_transaction(features)
            
            txn_id = transaction_ids[idx] if transaction_ids is not None else f"TXN_{i}"
            actual_fraud = y_data.iloc[idx]
            
            result = {
                'transaction_id': txn_id,
                'actual_fraud': actual_fraud,
                'flagged': scores['is_flagged'],
                'iso_score': scores['iso_score'],
                'rf_proba': scores['rf_proba'],
                'xgb_proba': scores['xgb_proba'],
                'ensemble_score': scores['ensemble_score'],
                'confidence': scores['confidence']
            }
            results.append(result)
            
            if scores['is_flagged']:
                self.flag_suspicious_transaction(txn_id, features, scores)
        
        return pd.DataFrame(results)


class AlertManager:
    """Manage alerts and thresholding strategy"""
    
    def __init__(self, high_risk_threshold=0.8, medium_risk_threshold=0.6):
        self.high_risk_threshold = high_risk_threshold
        self.medium_risk_threshold = medium_risk_threshold
        self.alerts = []
    
    def generate_alert(self, transaction_id, scores, severity='MEDIUM'):
        """Generate alert based on fraud scores"""
        alert = {
            'timestamp': datetime.now(),
            'transaction_id': transaction_id,
            'severity': severity,
            'scores': scores,
            'action': self.get_action(severity)
        }
        self.alerts.append(alert)
        return alert
    
    def get_action(self, severity):
        """Get recommended action based on severity"""
        actions = {
            'LOW': 'Monitor',
            'MEDIUM': 'Review & Verify',
            'HIGH': 'Block & Investigate'
        }
        return actions.get(severity, 'Review')
    
    def classify_severity(self, confidence_score):
        """Classify alert severity based on confidence"""
        if confidence_score >= self.high_risk_threshold:
            return 'HIGH'
        elif confidence_score >= self.medium_risk_threshold:
            return 'MEDIUM'
        else:
            return 'LOW'
