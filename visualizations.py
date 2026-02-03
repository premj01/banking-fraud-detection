import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, auc, confusion_matrix, classification_report

class VisualizationEngine:
    """Create visualizations for fraud detection analysis"""
    
    def __init__(self, output_dir='./outputs'):
        self.output_dir = output_dir
        sns.set_style("whitegrid")
        plt.rcParams['figure.figsize'] = (12, 6)
    
    def plot_eda(self, df_features):
        """Create EDA visualizations"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Transaction Amount Distribution
        axes[0, 0].hist(df_features[df_features['fraud']==0]['amount'], bins=50, alpha=0.7, label='Legitimate', color='green')
        axes[0, 0].hist(df_features[df_features['fraud']==1]['amount'], bins=50, alpha=0.7, label='Fraudulent', color='red')
        axes[0, 0].set_xlabel('Transaction Amount')
        axes[0, 0].set_ylabel('Frequency')
        axes[0, 0].set_title('Transaction Amount Distribution by Fraud Status')
        axes[0, 0].legend()
        
        # Fraud Rate by Transaction Type
        fraud_by_type = df_features.groupby('Transaction_Type')['fraud'].agg(['sum', 'count'])
        fraud_by_type['rate'] = fraud_by_type['sum'] / fraud_by_type['count']
        axes[0, 1].barh(fraud_by_type.index, fraud_by_type['rate'], color='coral')
        axes[0, 1].set_xlabel('Fraud Rate')
        axes[0, 1].set_title('Fraud Rate by Transaction Type')
        
        # Transaction Status vs Fraud
        status_fraud = pd.crosstab(df_features['Transaction_Status'], df_features['fraud'])
        status_fraud.plot(kind='bar', ax=axes[1, 0], color=['green', 'red'])
        axes[1, 0].set_title('Transaction Status vs Fraud')
        axes[1, 0].set_ylabel('Count')
        axes[1, 0].legend(['Legitimate', 'Fraud'])
        
        # Fraud by Hour
        fraud_by_hour = df_features.groupby('hour')['fraud'].mean()
        axes[1, 1].plot(fraud_by_hour.index, fraud_by_hour.values, marker='o', color='purple')
        axes[1, 1].set_xlabel('Hour of Day')
        axes[1, 1].set_ylabel('Fraud Rate')
        axes[1, 1].set_title('Fraud Rate by Hour of Day')
        axes[1, 1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(f'{self.output_dir}/01_eda_analysis.png', dpi=100, bbox_inches='tight')
        plt.close()
        print("[OK] EDA visualization saved")
    
    def plot_model_comparison(self, results, y_test):
        """Compare model ROC curves and feature importance"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        
        # ROC Curves
        fpr_iso, tpr_iso, _ = roc_curve(y_test, results['iso_scores'])
        fpr_rf, tpr_rf, _ = roc_curve(y_test, results['rf_proba'])
        fpr_xgb, tpr_xgb, _ = roc_curve(y_test, results['xgb_proba'])
        
        ax1.plot(fpr_iso, tpr_iso, label=f"Isolation Forest (AUC={results['iso_auc']:.3f})", linewidth=2)
        ax1.plot(fpr_rf, tpr_rf, label=f"Random Forest (AUC={results['rf_auc']:.3f})", linewidth=2)
        ax1.plot(fpr_xgb, tpr_xgb, label=f"XGBoost (AUC={results['xgb_auc']:.3f})", linewidth=2)
        ax1.plot([0, 1], [0, 1], 'k--', label='Random Classifier', alpha=0.3)
        ax1.set_xlabel('False Positive Rate')
        ax1.set_ylabel('True Positive Rate')
        ax1.set_title('ROC Curves - Model Comparison')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Feature Importance
        top_rf = results['rf_importance'].head(8)
        top_xgb = results['xgb_importance'].head(8)
        
        x_pos = np.arange(len(top_rf))
        width = 0.35
        
        ax2.bar(x_pos - width/2, top_rf['importance'], width, label='Random Forest', alpha=0.8)
        ax2.bar(x_pos + width/2, top_xgb.iloc[:len(top_rf)]['importance'], width, label='XGBoost', alpha=0.8)
        ax2.set_xlabel('Features')
        ax2.set_ylabel('Importance')
        ax2.set_title('Top 8 Feature Importance Comparison')
        ax2.set_xticks(x_pos)
        ax2.set_xticklabels(top_rf['feature'], rotation=45, ha='right')
        ax2.legend()
        
        plt.tight_layout()
        plt.savefig(f'{self.output_dir}/02_model_comparison.png', dpi=100, bbox_inches='tight')
        plt.close()
        print("[OK] Model comparison visualization saved")
    
    def plot_realtime_results(self, real_time_df, y_test):
        """Visualize real-time flagging results"""
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        # Distribution of ensemble scores
        axes[0, 0].hist(real_time_df[real_time_df['actual_fraud']==0]['ensemble_score'], 
                       bins=30, alpha=0.7, label='Legitimate', color='green')
        axes[0, 0].hist(real_time_df[real_time_df['actual_fraud']==1]['ensemble_score'], 
                       bins=30, alpha=0.7, label='Fraudulent', color='red')
        axes[0, 0].axvline(0.66, color='black', linestyle='--', label='Threshold')
        axes[0, 0].set_xlabel('Ensemble Score')
        axes[0, 0].set_ylabel('Frequency')
        axes[0, 0].set_title('Distribution of Ensemble Fraud Scores')
        axes[0, 0].legend()
        
        # Model agreement
        axes[0, 1].scatter(real_time_df[real_time_df['actual_fraud']==0]['rf_proba'], 
                          real_time_df[real_time_df['actual_fraud']==0]['xgb_proba'],
                          alpha=0.5, s=20, label='Legitimate', color='green')
        axes[0, 1].scatter(real_time_df[real_time_df['actual_fraud']==1]['rf_proba'], 
                          real_time_df[real_time_df['actual_fraud']==1]['xgb_proba'],
                          alpha=0.5, s=20, label='Fraudulent', color='red')
        axes[0, 1].set_xlabel('Random Forest Probability')
        axes[0, 1].set_ylabel('XGBoost Probability')
        axes[0, 1].set_title('Model Agreement - RF vs XGBoost')
        axes[0, 1].legend()
        
        # Confusion matrix
        cm = confusion_matrix(real_time_df['actual_fraud'], real_time_df['flagged'])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[1, 0], cbar=False)
        axes[1, 0].set_xlabel('Predicted')
        axes[1, 0].set_ylabel('Actual')
        axes[1, 0].set_title('Confusion Matrix - Real-time Detection')
        
        # Flagging breakdown
        status = pd.DataFrame({
            'Status': ['Flagged', 'Not Flagged'],
            'Fraud Cases': [
                ((real_time_df['flagged']==1) & (real_time_df['actual_fraud']==1)).sum(),
                ((real_time_df['flagged']==0) & (real_time_df['actual_fraud']==1)).sum()
            ],
            'Legitimate Cases': [
                ((real_time_df['flagged']==1) & (real_time_df['actual_fraud']==0)).sum(),
                ((real_time_df['flagged']==0) & (real_time_df['actual_fraud']==0)).sum()
            ]
        })
        status.set_index('Status')[['Fraud Cases', 'Legitimate Cases']].plot(
            kind='bar', ax=axes[1, 1], color=['red', 'green'])
        axes[1, 1].set_title('Flagging Results Breakdown')
        axes[1, 1].set_ylabel('Count')
        
        plt.tight_layout()
        plt.savefig(f'{self.output_dir}/03_realtime_flagging.png', dpi=100, bbox_inches='tight')
        plt.close()
        print("[OK] Real-time flagging visualization saved")
