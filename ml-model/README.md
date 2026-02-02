# ML Model gRPC Server

This is a Python gRPC server for fraud detection using machine learning.

## Setup

1. **Run setup script**:
   ```bash
   setup.bat
   ```

   This will:
   - Create a Python virtual environment
   - Install dependencies
   - Generate gRPC code from proto file

2. **Start the server**:
   ```bash
   start-server.bat
   ```

   Or manually:
   ```bash
   venv\Scripts\activate
   python server.py
   ```

## Integrating Your ML Model

Replace the `predict_fraud` method in `server.py` with your actual ML model:

```python
def predict_fraud(self, request):
    # Load your trained model
    import joblib
    model = joblib.load('fraud_model.pkl')
    
    # Extract features
    features = [
        request.amount_value,
        request.sender_txn_count_1min,
        request.sender_txn_count_10min,
        # ... more features
    ]
    
    # Make prediction
    prediction = model.predict([features])
    risk_score = model.predict_proba([features])[0][1]
    
    return {
        'is_fraud': bool(prediction[0]),
        'risk_score': float(risk_score),
        # ... other fields
    }
```

## Testing

The server listens on port 50051 and accepts gRPC requests from the Node.js backend.
