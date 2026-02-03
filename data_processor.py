import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from datetime import datetime

class DataPreprocessor:
    """Handle data loading, cleaning, and feature engineering"""
    
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.df = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_cols = None
        
    def load_data(self):
        """Load CSV data"""
        self.df = pd.read_csv(self.csv_path)
        print(f"[OK] Data loaded: {self.df.shape}")
        return self.df
    
    def clean_data(self):
        """Clean and preprocess data"""
        df = self.df.copy()
        
        # Parse datetime
        df['DateTime'] = pd.to_datetime(df['Date'] + ' ' + df['Time'], 
                                        format='%d/%m/%y %I:%M:%S %p', errors='coerce')
        df['DateTime'].fillna(pd.Timestamp.now(), inplace=True)
        
        # Drop unnecessary columns
        drop_cols = ['Transaction_ID', 'Date', 'Time', 'Merchant_ID', 'Customer_ID', 'Device_ID', 'IP_Address']
        df = df.drop(columns=[col for col in drop_cols if col in df.columns])
        
        # Numeric columns
        numeric_cols = ['Transaction_Amount_Deviation', 'Days_Since_Last_Transaction', 'amount', 'Transaction_Frequency']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            df[col].fillna(df[col].median(), inplace=True)
        
        # Categorical columns
        categorical_cols = ['Transaction_Type', 'Payment_Gateway', 'Device_OS', 
                           'Merchant_Category', 'Transaction_Channel', 'Transaction_Status']
        for col in categorical_cols:
            if col in df.columns:
                df[col] = df[col].fillna('Unknown')
        
        self.df = df
        print("[OK] Data cleaning complete")
        return df
    
    def engineer_features(self):
        """Create engineered features"""
        df = self.df.copy()
        numeric_cols = ['Transaction_Amount_Deviation', 'Days_Since_Last_Transaction', 'amount', 'Transaction_Frequency']
        categorical_cols = ['Transaction_Type', 'Payment_Gateway', 'Device_OS', 
                           'Merchant_Category', 'Transaction_Channel', 'Transaction_Status']
        
        # Time-based features
        df['hour'] = df['DateTime'].dt.hour
        df['day_of_week'] = df['DateTime'].dt.dayofweek
        df['day_of_month'] = df['DateTime'].dt.day
        df['month'] = df['DateTime'].dt.month
        
        # Risk indicators
        df['is_high_amount'] = (df['amount'] > df['amount'].quantile(0.75)).astype(int)
        df['is_low_frequency'] = (df['Transaction_Frequency'] <= 2).astype(int)
        df['amount_deviation_high'] = (abs(df['Transaction_Amount_Deviation']) > 50).astype(int)
        df['failed_status'] = (df['Transaction_Status'] == 'Failed').astype(int)
        df['pending_status'] = (df['Transaction_Status'] == 'Pending').astype(int)
        
        # Encode categorical variables
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[col + '_encoded'] = le.fit_transform(df[col])
                self.label_encoders[col] = le
        
        engineered_features = ['hour', 'day_of_week', 'day_of_month', 'month', 
                             'is_high_amount', 'is_low_frequency', 'amount_deviation_high',
                             'failed_status', 'pending_status']
        
        self.feature_cols = (numeric_cols + engineered_features + 
                            [col + '_encoded' for col in categorical_cols])
        
        self.df = df
        print(f"[OK] Feature engineering complete: {len(self.feature_cols)} features")
        return df, self.feature_cols
    
    def prepare_features(self):
        """Prepare feature matrix"""
        X = self.df[self.feature_cols].fillna(0)
        y = self.df['fraud']
        
        # Time-based split
        split_point = int(len(X) * 0.7)
        split_point_val = int(len(X) * 0.85)
        
        X_train, y_train = X.iloc[:split_point], y.iloc[:split_point]
        X_val, y_val = X.iloc[split_point:split_point_val], y.iloc[split_point:split_point_val]
        X_test, y_test = X.iloc[split_point_val:], y.iloc[split_point_val:]
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        X_test_scaled = self.scaler.transform(X_test)
        
        print(f"[OK] Data split - Train: {X_train.shape}, Val: {X_val.shape}, Test: {X_test.shape}")
        
        return {
            'X_train': X_train, 'y_train': y_train,
            'X_val': X_val, 'y_val': y_val,
            'X_test': X_test, 'y_test': y_test,
            'X_train_scaled': X_train_scaled,
            'X_val_scaled': X_val_scaled,
            'X_test_scaled': X_test_scaled,
            'scaler': self.scaler
        }
