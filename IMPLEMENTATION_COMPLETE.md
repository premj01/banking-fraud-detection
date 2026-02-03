# ✅ Fraud Detection System - Implementation Complete

## 🎉 What's Been Built

A complete real-time fraud detection system with:

1. **WebSocket Server** - Broadcasting fraud alerts via `real-time-stream` event
2. **REST API Endpoint** - POST `/api/transactions/detect` accepting text values
3. **Three-Layer Detection**:
   - Static banking rules (hard limits)
   - Behavioral anomaly detection (user profile analysis)
   - ML model via gRPC (Python service)
4. **PostgreSQL Database** - Storing all transactions and user profiles
5. **gRPC Integration** - Node.js ↔ Python communication
6. **Modular Architecture** - Clean separation of concerns

---

## 📁 Project Structure

```
Avinya4/
├── proto/
│   └── fraud_detection.proto          # gRPC contract
│
├── ml-model/                           # Python ML Service
│   ├── server.py                       # gRPC server
│   ├── requirements.txt
│   ├── setup.bat                       # Setup script
│   ├── start-server.bat                # Start script
│   └── README.md
│
├── backend/
│   ├── config/
│   │   └── fraud-rules.js              # Fraud detection rules
│   ├── grpc/
│   │   └── fraud-client.js             # gRPC client
│   ├── repositories/
│   │   ├── client-profile.repository.js
│   │   └── fraud-transaction.repository.js
│   ├── services/
│   │   └── fraud-detection.service.js  # Main detection logic
│   ├── controllers/
│   │   └── fraud.controller.js
│   ├── routes/
│   │   └── fraud.routes.js
│   ├── utils/
│   │   └── geo-calculator.js
│   └── prisma/
│       └── schema.prisma               # Database schema
│
├── frontend/                           # React app (existing)
│
├── test-transaction.json               # Sample test data
├── FRAUD_DETECTION_GUIDE.md            # Complete usage guide
└── SIMPLIFIED_IMPLEMENTATION.md        # Implementation details
```

---

## 🚀 Quick Start

### 1. Start Python ML Server

```bash
cd ml-model
setup.bat
start-server.bat
```

**Output**:
```
✅ gRPC ML server started on port 50051
📊 Waiting for fraud detection requests...
```

### 2. Backend is Already Running

```
✅ Database connected successfully
🚀 Server running on port 5000
📦 Environment: development
```

### 3. Test the System

```bash
curl -X POST http://localhost:5000/api/transactions/detect ^
  -H "Content-Type: application/json" ^
  -d @test-transaction.json
```

---

## 🔄 Detection Flow

```
Transaction → Static Rules → Behavioral Analysis → ML Model → Database → WebSocket
```

### Layer 1: Static Rules (Immediate)
- Amount > 100,000 INR → FRAUD
- Transactions in 1 min > 3 → FRAUD
- Transactions in 10 min > 10 → FRAUD
- Amount in 24 hrs > 200,000 INR → FRAUD

### Layer 2: Behavioral Analysis (If user profile exists)
- Monthly limit exceeded → FRAUD
- Amount deviation > 300% → FRAUD
- Geographic anomaly → FRAUD
- Rapid contiguous transactions → FRAUD

### Layer 3: ML Model (Always called if not flagged earlier)
- Calls Python gRPC service
- Returns fraud prediction
- Fallback to rule-based if gRPC fails

---

## 📊 Database Tables

### `client_profiles`
Stores user information and transaction history:
- Customer ID, Account ID
- Account type, KYC status
- Geographic data (state, city, coordinates)
- Monthly limit and current spend
- Last 30 valid transactions (for behavior analysis)

### `fraud_transactions`
Stores all transactions with fraud detection results:
- Transaction details
- Sender/receiver information
- Device and payment details
- Fraud detection results (is_fraud, risk_score, reasons)

---

## 🌐 API Endpoints

### POST /api/transactions/detect

**Input** (Text values, not numeric):
```json
{
  "transaction_id": "TXN123",
  "transaction_type": "PAYMENT",
  "amount_value": 7500.89,
  "sender_customer_id": "CUST123",
  "sender_account_type": "SAVINGS",
  "sender_kyc_status": "FULL_KYC",
  "device_type": "MOBILE",
  "device_os": "Android",
  "ip_risk": "LOW",
  "receiver_type": "MERCHANT",
  "merchant_category": "FOOD",
  "merchant_risk_level": "LOW",
  "payment_method": "UPI",
  "authorization_type": "PIN"
  // ... more fields
}
```

**Output**:
```json
{
  "success": true,
  "transaction_id": "TXN123",
  "is_fraud": false,
  "risk_score": 0.0,
  "fraud_reason_unusual_amount": false,
  "fraud_reason_geo_distance_anomaly": false,
  "fraud_reason_high_velocity": false,
  "fraud_severity": "LOW",
  "flag_color": "GREEN",
  "reason_of_fraud": "No fraud detected"
}
```

---

## 📡 WebSocket Events

### Event: `real-time-stream`

Broadcasts fraud alerts in real-time:

```javascript
socket.on('real-time-stream', (data) => {
  console.log(data)
  // {
  //   transaction_id: "TXN123",
  //   timestamp: "2024-02-03T10:30:00Z",
  //   amount_value: 150000,
  //   sender_state: "Maharashtra",
  //   sender_city: "Mumbai",
  //   is_fraud: true,
  //   risk_score: 1.0,
  //   fraud_severity: "HIGH",
  //   flag_color: "RED",
  //   reason_of_fraud: "Amount exceeds limit"
  // }
})
```

---

## 🧪 Test Scenarios

### ✅ Normal Transaction (Pass)
```json
{
  "amount_value": 7500,
  "sender_txn_count_1min": 1,
  "sender_txn_count_10min": 3,
  "sender_amount_24hr": 10500
}
```
**Result**: `is_fraud: false`, `flag_color: GREEN`

### ❌ High Amount (Fail - Static Rule)
```json
{
  "amount_value": 150000
}
```
**Result**: `is_fraud: true`, `flag_color: RED`, `reason: "Amount exceeds limit"`

### ❌ High Velocity (Fail - Static Rule)
```json
{
  "sender_txn_count_1min": 5,
  "sender_txn_count_10min": 12
}
```
**Result**: `is_fraud: true`, `flag_color: RED`, `reason: "Transaction velocity exceeded"`

---

## 🔧 Configuration

### Fraud Rules (`backend/config/fraud-rules.js`)

```javascript
export const FRAUD_RULES = {
  MAX_SINGLE_TRANSACTION: 100000,
  MAX_TRANSACTIONS_1MIN: 3,
  MAX_TRANSACTIONS_10MIN: 10,
  MAX_AMOUNT_24HR: 200000,
  MAX_MONTHLY_LIMIT: 500000
}
```

Modify these values to adjust detection sensitivity.

---

## 🤖 ML Model Integration

The Python gRPC server (`ml-model/server.py`) has a placeholder `predict_fraud` method.

**To integrate your ML model**:

1. Train your model and save it (e.g., `model.pkl`)
2. Update `predict_fraud` method:

```python
def predict_fraud(self, request):
    import joblib
    model = joblib.load('model.pkl')
    
    features = [
        request.amount_value,
        request.sender_txn_count_1min,
        # ... extract more features
    ]
    
    prediction = model.predict([features])
    risk_score = model.predict_proba([features])[0][1]
    
    return {
        'is_fraud': bool(prediction[0]),
        'risk_score': float(risk_score),
        # ... other fields
    }
```

---

## 📈 Monitoring

### View Fraud Statistics

```sql
SELECT 
  is_fraud,
  COUNT(*) as count,
  AVG(risk_score) as avg_risk,
  AVG(amount_value) as avg_amount
FROM fraud_transactions
GROUP BY is_fraud;
```

### Recent Fraud Transactions

```sql
SELECT 
  transaction_id,
  amount_value,
  sender_customer_id,
  fraud_severity,
  reason_of_fraud,
  created_at
FROM fraud_transactions
WHERE is_fraud = true
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Features Implemented

- [x] WebSocket server with `real-time-stream` event
- [x] POST `/api/transactions/detect` endpoint
- [x] Text values (SAVINGS, MOBILE, etc.) not numeric codes
- [x] Static banking rules (Step 3.1)
- [x] Behavioral anomaly detection (Step 3.2)
- [x] User profile fetching from database
- [x] Monthly limit checking
- [x] Transaction history analysis (last 30 transactions)
- [x] gRPC ML model integration (Step 4)
- [x] PostgreSQL logging
- [x] User profile updates (add new transaction, remove oldest)
- [x] Real-time WebSocket broadcasting
- [x] Proto file for gRPC
- [x] Python ML server with placeholder
- [x] Modular architecture

---

## 📚 Documentation

- **FRAUD_DETECTION_GUIDE.md** - Complete usage guide with examples
- **SIMPLIFIED_IMPLEMENTATION.md** - Implementation details
- **ml-model/README.md** - Python ML service documentation
- **test-transaction.json** - Sample test data

---

## 🎯 Next Steps

1. **Test the system** with various transaction scenarios
2. **Integrate your ML model** in `ml-model/server.py`
3. **Create user profiles** in `client_profiles` table for testing behavioral detection
4. **Build frontend dashboard** to visualize real-time fraud alerts
5. **Add more fraud detection rules** as needed
6. **Deploy to production** when ready

---

## 🚨 Important Notes

1. **gRPC Fallback**: If Python ML server is not running, the system falls back to rule-based detection
2. **User Profiles**: Behavioral detection only works if user profile exists in database
3. **WebSocket**: Always broadcasts fraud alerts regardless of detection layer
4. **Database**: All transactions are logged, fraud or not
5. **Text Values**: API accepts text values (SAVINGS, MOBILE) not numeric codes (0, 1)

---

## 🎉 System Status

✅ **Backend**: Running on port 5000
✅ **Database**: Connected (PostgreSQL/Neon)
✅ **WebSocket**: Active and broadcasting
✅ **gRPC**: Ready (start Python server)
✅ **API**: `/api/transactions/detect` available
✅ **Frontend**: Running on port 3000

**Your fraud detection system is fully operational!** 🚀
