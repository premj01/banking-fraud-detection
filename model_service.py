import os
import joblib
import numpy as np
import pandas as pd

from real_time_scorer import RealTimeTransactionScorer, AlertManager
from data_processor import DataPreprocessor

# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------
MODULE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(MODULE_DIR, "models")
DATA_CSV = os.path.join(MODULE_DIR, "Copy of Sample_DATA.csv")

# -------------------------------------------------------------------
# Canonical feature order (MUST match training)
# This guarantees runtime safety even without CSV
# -------------------------------------------------------------------
FEATURE_NAMES = [
    "amount",
    "is_high_amount",
    "Transaction_Amount_Deviation",
    "Days_Since_Last_Transaction",
    "day_of_month",
    "month",
    "day_of_week",
    "hour",
    "Merchant_Risk_Level",
    "Device_Risk_Score",
    "Device_Type_encoded",
    "Location_Risk_encoded",
    "Transaction_Status_encoded",
    "Card_Type_encoded",
    "Customer_Segment_encoded",
    "Transaction_Type_encoded",
    "Device_OS_encoded",
    "Merchant_Category_encoded",
    "Time_Zone_Risk_encoded",
]


class ModelService:
    def __init__(self, model_dir: str = MODEL_DIR):
        self.model_dir = model_dir

        # defaults (must exist even if CSV is missing)
        self.feature_cols = FEATURE_NAMES.copy()
        self.medians = {}
        self.high_amount_threshold = None
        self.label_encoders = {}

        self._load_artifacts()
        self.alert_manager = AlertManager()

    # ------------------------------------------------------------------
    # Load trained artifacts
    # ------------------------------------------------------------------
    def _load_artifacts(self):
        self.iso_forest = joblib.load(os.path.join(self.model_dir, "isolation_forest.pkl"))
        self.rf_model = joblib.load(os.path.join(self.model_dir, "random_forest.pkl"))
        self.xgb_model = joblib.load(os.path.join(self.model_dir, "xgboost.pkl"))
        self.scaler = joblib.load(os.path.join(self.model_dir, "scaler.pkl"))

        self.scorer = RealTimeTransactionScorer(
            iso_forest=self.iso_forest,
            rf_model=self.rf_model,
            xgb_model=self.xgb_model,
            scaler=self.scaler,
            threshold=0.5,
        )

        # Optional: enrich preprocessing if CSV is present
        if os.path.exists(DATA_CSV):
            try:
                dp = DataPreprocessor(DATA_CSV)
                dp.load_data()
                dp.clean_data()
                _, feature_cols = dp.engineer_features()

                if feature_cols:
                    self.feature_cols = list(feature_cols)

                numeric_cols = [
                    "Transaction_Amount_Deviation",
                    "Days_Since_Last_Transaction",
                    "amount",
                    "Transaction_Frequency",
                ]

                self.medians = dp.df[numeric_cols].median().to_dict()
                self.high_amount_threshold = dp.df["amount"].quantile(0.75)
                self.label_encoders = dp.label_encoders
            except Exception as e:
                # fail-safe: never block inference
                print(f"[WARN] Preprocessor init skipped: {e}")

    # ------------------------------------------------------------------
    # Score engineered feature vector
    # ------------------------------------------------------------------
    def score_features(self, features):
        arr = np.asarray(features, dtype=float).reshape(1, -1)

        result = self.scorer.score_transaction(arr.flatten())
        severity = self.alert_manager.classify_severity(result["confidence"])
        action = self.alert_manager.get_action(severity)

        return {
            "iso_score": float(result["iso_score"]),
            "rf_proba": float(result["rf_proba"]),
            "xgb_proba": float(result["xgb_proba"]),
            "ensemble_score": float(result["ensemble_score"]),
            "is_flagged": bool(result["is_flagged"]),
            "confidence": float(result["confidence"]),
            "severity": severity,
            "recommended_action": action,
        }

    # ------------------------------------------------------------------
    # Accept either engineered features or raw transaction dict
    # ------------------------------------------------------------------
    def features_from_dict(self, d: dict):
        # already-engineered input
        if all(k in d for k in FEATURE_NAMES):
            return [float(d.get(k, 0.0)) for k in FEATURE_NAMES]

        # raw transaction
        return self.raw_to_features(d)

    # ------------------------------------------------------------------
    # Raw transaction → engineered features
    # ------------------------------------------------------------------
    def raw_to_features(self, raw: dict):
        if not self.feature_cols:
            raise RuntimeError("feature_cols not initialized")

        def num(key, default=0.0):
            try:
                return float(raw.get(key, self.medians.get(key, default)))
            except Exception:
                return float(self.medians.get(key, default) or default)

        # datetime parsing
        if raw.get("DateTime"):
            dt = pd.to_datetime(raw["DateTime"], errors="coerce")
        else:
            date = raw.get("Date", "")
            time = raw.get("Time", "")
            dt = pd.to_datetime(f"{date} {time}", errors="coerce")

        hour = 0 if pd.isna(dt) else dt.hour
        day_of_week = 0 if pd.isna(dt) else dt.dayofweek
        day_of_month = 0 if pd.isna(dt) else dt.day
        month = 0 if pd.isna(dt) else dt.month

        amount = num("amount")
        tx_dev = num("Transaction_Amount_Deviation")
        tx_freq = num("Transaction_Frequency")
        days_since = num("Days_Since_Last_Transaction")

        is_high_amount = int(
            amount > (self.high_amount_threshold or self.medians.get("amount", 0))
        )

        # categorical encoding
        def encode(col, val):
            le = self.label_encoders.get(col)
            if not le:
                return 0
            try:
                return int(le.transform([str(val)])[0])
            except Exception:
                return int(le.transform(["Unknown"])[0]) if "Unknown" in le.classes_ else 0

        ordered = []
        for col in self.feature_cols:
            if col == "amount":
                ordered.append(amount)
            elif col == "Transaction_Amount_Deviation":
                ordered.append(tx_dev)
            elif col == "Days_Since_Last_Transaction":
                ordered.append(days_since)
            elif col == "day_of_month":
                ordered.append(day_of_month)
            elif col == "month":
                ordered.append(month)
            elif col == "day_of_week":
                ordered.append(day_of_week)
            elif col == "hour":
                ordered.append(hour)
            elif col == "is_high_amount":
                ordered.append(is_high_amount)
            elif col.endswith("_encoded"):
                base = col.replace("_encoded", "")
                ordered.append(float(encode(base, raw.get(base, "Unknown"))))
            else:
                ordered.append(0.0)

        return ordered
