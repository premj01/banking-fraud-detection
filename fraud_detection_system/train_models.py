"""
Train all models on the dataset and save trained artifacts to ./models
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
import joblib
from data_processor import DataPreprocessor
from ml_models import MLModels

DATA_PATH = r"c:\Users\ringa\OneDrive\Desktop\project\new\Copy of Sample_DATA.csv"
MODEL_DIR = os.path.join(os.getcwd(), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

print('\n' + '='*70)
print('TRAINING MODELS ON DATASET')
print('='*70)

# Prepare data
preprocessor = DataPreprocessor(DATA_PATH)
preprocessor.load_data()
preprocessor.clean_data()
df_features, feature_cols = preprocessor.engineer_features()

splits = preprocessor.prepare_features()
X_train_scaled = splits['X_train_scaled']
y_train = splits['y_train']
X_val_scaled = splits['X_val_scaled']
y_val = splits['y_val']
scaler = splits['scaler']

# Train models
ml = MLModels(model_dir=MODEL_DIR)

print('\n[Training] Isolation Forest...')
ml.train_isolation_forest(X_train_scaled, y_train)

print('[Training] Random Forest...')
ml.train_random_forest(X_train_scaled, X_val_scaled, y_train, y_val)

print('[Training] XGBoost...')
ml.train_xgboost(X_train_scaled, X_val_scaled, y_train, y_val)

# Save models (MLModels.save_models handles model files)
ml.save_models()
# Save scaler
joblib.dump(scaler, os.path.join(MODEL_DIR, 'scaler.pkl'))

print('\n[OK] Models and scaler saved to: {}'.format(MODEL_DIR))
print('='*70)
