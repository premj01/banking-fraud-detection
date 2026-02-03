from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from model_service import ModelService

app = FastAPI(title="Fraud Detection API")
service = ModelService()

class FeaturesPayload(BaseModel):
    features: List[float]

class DictPayload(BaseModel):
    transaction: Dict[str, Any]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/score")
def score(payload: FeaturesPayload):
    if len(payload.features) != 19:
        raise HTTPException(status_code=400, detail="features must be length 19")
    out = service.score_features(payload.features)
    return out

@app.post("/score_dict")
def score_dict(payload: DictPayload):
    features = service.features_from_dict(payload.transaction)
    out = service.score_features(features)
    return {"features": features, **out}


@app.post("/score_raw")
def score_raw(payload: DictPayload):
    """Accept raw transaction fields (Date/Time, category strings, numeric fields).
    Returns engineered features and model outputs."""
    if not isinstance(payload.transaction, dict):
        raise HTTPException(status_code=400, detail="transaction must be a dict")
    features = service.features_from_dict(payload.transaction)
    out = service.score_features(features)
    return {"engineered_features": features, **out}

@app.post("/retrain")
def retrain():
    # lightweight retrain trigger: run the existing training script
    import subprocess, os
    script = os.path.join(os.getcwd(), 'train_models.py')
    try:
        subprocess.check_call(["python", script])
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=str(e))
    # reload artifacts
    service._load_artifacts()
    return {"status": "retrained"}
