# Fraud Detection System - Complete Guide

## ✅ What's Been Implemented

### 1. WebSocket Server
- Event: `real-time-stream`
- Broadcasts fraud detection results in real-time
- Safe data only (no sensitive information)

### 2. Fraud Detection Endpoint
- **POST** `/api/transactions/detect`
- Accepts transaction data with text values (not numeric codes)
- Returns fraud detection results

### 3. Three-Layer Detection System

#### Layer 1: Static Banking Rules (Step 3.1)
Hard limits checked immediately:
- Single transaction limit: 100,000 INR
- Max transactions in 1 minute: 3
- Max transactions in 10 minutes: 10
- Max amount in 24 hours: 200,000 INR

**If violated → Log to DB → Send to WebSocket → STOP**

#### Layer 2: Behavioral Anomalies (Step 3.2)
Fetches user profile from database and checks:
- Monthly limit exceeded
- Amount deviation from typical transactions (300%+)
- Geographic anomalies
- Contiguous rapid transactions

**If detected → Log to DB → Update user data → Send to WebSocket → STOP**

#### Layer 3: ML Model via gRPC (Step 4)
Calls Python ML service for advanced detection
**Always → Log to DB → Update user data (if not fraud) → Send to WebSocket**

### 4. Database Tables
- `client_profiles` - User profiles with transaction history
- `fraud_transactions` - All transactions with fraud detection results

### 5. gRPC Integration
- Proto file: `proto/fraud_detection.proto`
- Python ML server: `ml-model/server.py`
- Node.js gRPC client: `backend/grpc/fraud-client.js`

---

## 🚀 Setup & Running

### Step 1: Start Python ML Server

```bash
cd ml-model
setup.bat
start-server.bat
```

You should see:
```
✅ gRPC ML server started on port 50051
📊 Waiting for fraud detection requests...
```

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 5000
📦 Environment: development
```

### Step 3: Start Frontend (Optional)

```bash
cd frontend
npm run dev
```

---

## 🧪 Testing

### Test 1: Normal Transaction (Should Pass)

```bash
curl -X POST http://localhost:5000/api/transactions/detect ^
  -H "Content-Type: application/json" ^
  -d @test-transaction.json
```

**Expected Response**:
```json
{
  "success": true,
  "transaction_id": "TXN_TEST_001",
  "is_fraud": false,
  "risk_score": 0.0,
  "fraud_reason_unusual_amount": false,
  "fraud_reason_geo_distance_anomaly": false,
  "fraud_reason_high_velocity": false,
  "fraud_severity": "LOW",
  "flag_color": "GREEN",
  "reason_of_fraud": "No fraud detected by ML model"
}
```

### Test 2: High Amount Transaction (Should Fail - Static Rule)

```json
{
  "transaction_id": "TXN_HIGH_AMOUNT",
  "transaction_type": "PAYMENT",
  "transaction_status": "SUCCESS",
  "transaction_timestamp": "2024-02-03T10:30:00Z",
  "amount_value": 150000,
  "amount_currency": "INR",
  "sender_customer_id": "CUST_123",
  "sender_account_id": "ACC_123",
  "sender_account_type": "SAVINGS",
  "sender_kyc_status": "FULL_KYC",
  "sender_account_age_days": 1850,
  "sender_state": "Maharashtra",
  "sender_city": "Mumbai",
  "sender_txn_count_1min": 1,
  "sender_txn_count_10min": 3,
  "sender_amount_24hr": 10500,
  "device_type": "MOBILE",
  "device_os": "Android",
  "app_version": "2.1.0",
  "ip_risk": "LOW",
  "receiver_type": "MERCHANT",
  "receiver_bank": "HDFC Bank",
  "merchant_category": "ELECTRONICS",
  "merchant_risk_level": "LOW",
  "payment_method": "UPI",
  "authorization_type": "PIN"
}
```

**Expected Response**:
```json
{
  "success": true,
  "transaction_id": "TXN_HIGH_AMOUNT",
  "is_fraud": true,
  "risk_score": 1.0,
  "fraud_reason_unusual_amount": true,
  "fraud_reason_high_velocity": false,
  "fraud_severity": "HIGH",
  "flag_color": "RED",
  "reason_of_fraud": "Amount 150000 exceeds single transaction limit of 100000 INR"
}
```

### Test 3: High Velocity Transaction (Should Fail - Static Rule)

```json
{
  "transaction_id": "TXN_HIGH_VELOCITY",
  "transaction_type": "TRANSFER",
  "transaction_status": "SUCCESS",
  "transaction_timestamp": "2024-02-03T10:30:00Z",
  "amount_value": 5000,
  "amount_currency": "INR",
  "sender_customer_id": "CUST_456",
  "sender_account_id": "ACC_456",
  "sender_account_type": "SAVINGS",
  "sender_kyc_status": "FULL_KYC",
  "sender_account_age_days": 500,
  "sender_state": "Karnataka",
  "sender_city": "Bangalore",
  "sender_txn_count_1min": 5,
  "sender_txn_count_10min": 12,
  "sender_amount_24hr": 25000,
  "device_type": "MOBILE",
  "device_os": "iOS",
  "app_version": "2.0.0",
  "ip_risk": "MEDIUM",
  "receiver_type": "PERSON",
  "receiver_bank": "ICICI Bank",
  "merchant_category": "",
  "merchant_risk_level": "",
  "payment_method": "UPI",
  "authorization_type": "PIN"
}
```

**Expected Response**:
```json
{
  "success": true,
  "transaction_id": "TXN_HIGH_VELOCITY",
  "is_fraud": true,
  "risk_score": 1.0,
  "fraud_reason_high_velocity": true,
  "fraud_severity": "HIGH",
  "flag_color": "RED",
  "reason_of_fraud": "Transaction count in 1 minute (5) exceeds limit of 3; Transaction count in 10 minutes (12) exceeds limit of 10"
}
```

---

## 📡 WebSocket Testing

### Using JavaScript (Browser Console or Node.js)

```javascript
const socket = io('http://localhost:5000')

socket.on('real-time-stream', (data) => {
  console.log('Fraud Alert:', data)
  /*
  {
    transaction_id: "TXN_123",
    timestamp: "2024-02-03T10:30:00Z",
    amount_value: 150000,
    sender_state: "Maharashtra",
    sender_city: "Mumbai",
    is_fraud: true,
    risk_score: 1.0,
    fraud_severity: "HIGH",
    flag_color: "RED",
    reason_of_fraud: "Amount exceeds limit"
  }
  */
})
```

### Using Postman or WebSocket Client

1. Connect to: `ws://localhost:5000`
2. Listen for event: `real-time-stream`
3. Send transactions via POST endpoint
4. Watch real-time alerts

---

## 📊 Database Queries

### View All Fraud Transactions

```sql
SELECT 
  transaction_id,
  amount_value,
  sender_customer_id,
  is_fraud,
  risk_score,
  fraud_severity,
  reason_of_fraud,
  created_at
FROM fraud_transactions
ORDER BY created_at DESC
LIMIT 10;
```

### View Fraud Statistics

```sql
SELECT 
  is_fraud,
  COUNT(*) as count,
  AVG(amount_value) as avg_amount,
  AVG(risk_score) as avg_risk_score
FROM fraud_transactions
GROUP BY is_fraud;
```

### View User Profile

```sql
SELECT 
  customer_id,
  account_type,
  monthly_limit,
  current_month_spend,
  last_30_transactions
FROM client_profiles
WHERE customer_id = 'CUST_123';
```

---

## 🔧 Configuration

### Fraud Rules (`backend/config/fraud-rules.js`)

```javascript
export const FRAUD_RULES = {
  MAX_SINGLE_TRANSACTION: 100000,      // Change this
  MAX_TRANSACTIONS_1MIN: 3,            // Change this
  MAX_TRANSACTIONS_10MIN: 10,          // Change this
  MAX_AMOUNT_24HR: 200000,             // Change this
  MAX_MONTHLY_LIMIT: 500000,           // Change this
  HIGH_RISK_AMOUNT: 50000,
  SUSPICIOUS_VELOCITY: 5,
  MAX_GEO_DISTANCE_KM: 500
}
```

---

## 🤖 Integrating Your ML Model

Replace the `predict_fraud` method in `ml-model/server.py`:

```python
def predict_fraud(self, request):
    # 1. Load your trained model
    import joblib
    model = joblib.load('path/to/your/model.pkl')
    
    # 2. Extract features
    features = [
        request.amount_value,
        request.sender_txn_count_1min,
        request.sender_txn_count_10min,
        request.sender_amount_24hr,
        # Add more features as needed
    ]
    
    # 3. Make prediction
    prediction = model.predict([features])
    risk_score = model.predict_proba([features])[0][1]
    
    # 4. Return results
    return {
        'is_fraud': bool(prediction[0]),
        'risk_score': float(risk_score),
        'unusual_amount': request.amount_value > 50000,
        'geo_anomaly': False,  # Implement your logic
        'high_velocity': request.sender_txn_count_1min >= 5,
        'severity': 'HIGH' if risk_score >= 0.8 else ('MEDIUM' if risk_score >= 0.5 else 'LOW'),
        'flag_color': 'RED' if prediction[0] else 'GREEN',
        'reason': 'ML model detected fraud' if prediction[0] else 'No fraud detected'
    }
```

---

## 📝 API Documentation

### POST /api/transactions/detect

**Request Body**:
```json
{
  "transaction_id": "string",
  "transaction_type": "TRANSFER" | "PAYMENT",
  "transaction_status": "SUCCESS",
  "transaction_timestamp": "ISO-8601",
  "amount_value": number,
  "amount_currency": "INR",
  "sender_customer_id": "string",
  "sender_account_id": "string",
  "sender_account_type": "SAVINGS" | "CURRENT",
  "sender_kyc_status": "MIN_KYC" | "FULL_KYC",
  "sender_account_age_days": number,
  "sender_state": "string",
  "sender_city": "string",
  "sender_txn_count_1min": number,
  "sender_txn_count_10min": number,
  "sender_amount_24hr": number,
  "device_type": "MOBILE" | "WEB",
  "device_os": "Android" | "iOS" | "Windows",
  "app_version": "string",
  "ip_risk": "LOW" | "MEDIUM" | "HIGH",
  "receiver_type": "PERSON" | "MERCHANT",
  "receiver_bank": "string",
  "merchant_category": "FOOD" | "ELECTRONICS" | "TRAVEL" | "HEALTH" | "UTILITIES" | "ENTERTAINMENT" | "SHOPPING" | "EDUCATION",
  "merchant_risk_level": "LOW" | "MEDIUM" | "HIGH",
  "payment_method": "UPI" | "CARD" | "NETBANKING",
  "authorization_type": "PIN" | "OTP" | "BIOMETRIC"
}
```

**Response**:
```json
{
  "success": true,
  "transaction_id": "string",
  "is_fraud": boolean,
  "risk_score": number,
  "fraud_reason_unusual_amount": boolean,
  "fraud_reason_geo_distance_anomaly": boolean,
  "fraud_reason_high_velocity": boolean,
  "fraud_severity": "LOW" | "MEDIUM" | "HIGH",
  "flag_color": "GREEN" | "RED",
  "reason_of_fraud": "string"
}
```

---

## 🎯 Flow Summary

```
1. Transaction arrives at POST /api/transactions/detect
   ↓
2. Check Static Rules (hard limits)
   → If fraud: Log → WebSocket → Return
   ↓
3. Fetch user profile from database
   → If no profile: Skip to step 4
   ↓
4. Check Behavioral Anomalies
   → If fraud: Log → WebSocket → Return
   ↓
5. Call gRPC ML Model
   ↓
6. Log transaction to database
   ↓
7. If not fraud: Update user profile
   ↓
8. Send to WebSocket (real-time-stream)
   ↓
9. Return response
```

---

## ✅ Checklist

- [x] WebSocket server with `real-time-stream` event
- [x] POST /api/transactions/detect endpoint
- [x] Static banking rules (Step 3.1)
- [x] Behavioral anomaly detection (Step 3.2)
- [x] gRPC ML model integration (Step 4)
- [x] PostgreSQL database logging
- [x] User profile management
- [x] Real-time WebSocket broadcasting
- [x] Proto file for gRPC
- [x] Python ML server with placeholder
- [x] Text values (not numeric codes)

---

## 🚨 Troubleshooting

### gRPC Connection Failed
- Make sure Python ML server is running on port 50051
- Check `ml-model/server.py` is running
- Backend will fallback to rule-based detection if gRPC fails

### Database Errors
```bash
cd backend
npx prisma db push
npx prisma generate
```

### WebSocket Not Broadcasting
- Check Socket.io is initialized in `server.js`
- Verify `io.emit('real-time-stream', data)` is called
- Test WebSocket connection separately

---

**Your fraud detection system is ready to use!** 🎉
