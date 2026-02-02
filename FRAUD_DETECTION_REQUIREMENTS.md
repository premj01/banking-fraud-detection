# Fraud Detection System Requirements

## Overview
Build a real-time fraud detection system that:
1. Receives transaction data via REST API
2. Processes it through gRPC to a Python ML service
3. Stores results in PostgreSQL
4. Broadcasts fraud alerts via WebSocket

---

## 1. Data Generator Endpoint

### Endpoint: `POST /api/transactions/generate`
**Purpose**: Generate sample transaction data for testing

**Response Format**: Array of transaction objects

### Transaction Schema (Full Data)
```json
{
  "transaction_id": "string",
  "transaction_type": 0 | 1,  // 0=TRANSFER, 1=PAYMENT
  "transaction_status": 1,     // 1=SUCCESS
  "transaction_timestamp": "ISO-8601 UTC string",
  "amount_value": "number",
  "amount_currency": "INR",
  
  // Sender Information
  "sender_customer_id": "string",
  "sender_account_id": "string",
  "sender_account_type": 0 | 1,  // 0=SAVINGS, 1=CURRENT
  "sender_kyc_status": 0 | 1,    // 0=MIN_KYC, 1=FULL_KYC
  "sender_account_age_days": "number",
  "sender_state": "string",
  "sender_city": "string",
  "sender_txn_count_1min": "number",
  "sender_txn_count_10min": "number",
  "sender_amount_24hr": "number",
  
  // Device Information
  "device_type": 0 | 1,          // 0=MOBILE, 1=WEB
  "device_os": 0 | 1 | 2,        // 0=Android, 1=iOS, 2=Windows
  "app_version": "string",
  "ip_risk": 0 | 1 | 2,          // 0=LOW, 1=MEDIUM, 2=HIGH
  
  // Receiver Information
  "receiver_type": 0 | 1,        // 0=PERSON, 1=MERCHANT
  "receiver_bank": "string",
  "merchant_category": 0-7,      // 0=FOOD, 1=ELECTRONICS, etc.
  "merchant_risk_level": 0 | 1 | 2,
  
  // Payment Information
  "payment_method": 0 | 1 | 2,   // 0=UPI, 1=CARD, 2=NETBANKING
  "authorization_type": 0 | 1 | 2, // 0=PIN, 1=OTP, 2=BIOMETRIC
  
  // FRAUD FIELDS (NOT sent to gRPC, only stored after detection)
  "is_fraud": 0 | 1,
  "risk_score": "number (0.0-1.0)",
  "fraud_reason_unusual_amount": 0 | 1,
  "fraud_reason_geo_distance_anomaly": 0 | 1,
  "fraud_reason_high_velocity": 0 | 1,
  "fraud_severity": 0 | 1 | 2,   // 0=LOW, 1=MEDIUM, 2=HIGH
  "flag_color": 0 | 1            // 0=GREEN, 1=RED
}
```

---

## 2. Transaction Processing Endpoint

### Endpoint: `POST /api/transactions/process`
**Purpose**: Process incoming transaction and detect fraud

### Request Body (WITHOUT fraud fields)
```json
{
  "transaction_id": "string",
  "transaction_type": 0 | 1,
  "transaction_timestamp": "ISO-8601",
  "amount_value": "number",
  "amount_currency": "INR",
  "sender_customer_id": "string",
  "sender_account_id": "string",
  "sender_account_type": 0 | 1,
  "sender_kyc_status": 0 | 1,
  "sender_account_age_days": "number",
  "sender_state": "string",
  "sender_city": "string",
  "device_type": 0 | 1,
  "device_os": 0 | 1 | 2,
  "app_version": "string",
  "ip_risk": 0 | 1 | 2,
  "receiver_type": 0 | 1,
  "receiver_bank": "string",
  "merchant_category": 0-7,
  "merchant_risk_level": 0 | 1 | 2,
  "payment_method": 0 | 1 | 2,
  "authorization_type": 0 | 1 | 2
}
```

### Processing Flow

#### Step 1: Hard Limit Checks
```javascript
// Check transaction limits BEFORE ML processing
1. Check sender's transaction count in last 1 minute
2. Check sender's transaction count in last 10 minutes
3. Check sender's total amount in last 24 hours
4. Check against user's monthly limit
5. If ANY hard limit exceeded → Flag as fraud immediately
```

#### Step 2: Fetch User Profile Data
```sql
-- Fetch from user_profiles table
SELECT 
  customer_id,
  account_id,
  account_type,
  account_age_days,
  account_created_at,
  kyc_status,
  
  -- Geographic data
  home_state,
  home_city,
  home_latitude,
  home_longitude,
  current_latitude,
  current_longitude,
  
  -- Limits and spending
  monthly_limit,
  current_month_spend,
  
  -- Last 30 valid transactions (for behavior analysis)
  last_30_transactions  -- JSON array with timestamps
  
FROM user_profiles
WHERE customer_id = ?
```

**If user profile NOT found**: Skip profile-based checks, proceed with basic fraud detection

#### Step 3: Calculate Additional Metrics
```javascript
// Calculate from fetched data
1. sender_txn_count_1min - Count transactions in last 1 minute
2. sender_txn_count_10min - Count transactions in last 10 minutes
3. sender_amount_24hr - Sum of amounts in last 24 hours
4. Geographic distance - Calculate distance between home and current location
5. Transaction velocity - Detect rapid repeated transactions
6. Amount anomaly - Compare with user's typical transaction amounts
```

#### Step 4: Send to gRPC ML Service
```protobuf
// Send transaction data + calculated metrics to Python ML service
// ML service returns fraud prediction
```

#### Step 5: Store Transaction
```javascript
// Store in transactions table with fraud detection results
if (is_fraud) {
  // Store in fraud_transactions table
  // DO NOT update last_30_transactions
} else {
  // Store in valid_transactions table
  // Update user_profiles.last_30_transactions (remove oldest, add newest)
}
```

#### Step 6: WebSocket Broadcast
```javascript
// Broadcast to dashboard (safe data only)
if (is_fraud || risk_score > 0.5) {
  io.emit('fraud-alert', {
    transaction_id,
    timestamp,
    amount_value,
    sender_state,
    sender_city,
    risk_score,
    fraud_severity,
    flag_color,
    // NO bank details, account IDs, or personal info
  })
}
```

---

## 3. Database Schema

### Table: `user_profiles`
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) UNIQUE NOT NULL,
  account_id VARCHAR(255) UNIQUE NOT NULL,
  account_type INTEGER NOT NULL,  -- 0=SAVINGS, 1=CURRENT
  account_age_days INTEGER NOT NULL,
  account_created_at TIMESTAMP NOT NULL,
  kyc_status INTEGER NOT NULL,    -- 0=MIN_KYC, 1=FULL_KYC
  
  -- Geographic data
  home_state VARCHAR(100),
  home_city VARCHAR(100),
  home_latitude DECIMAL(10, 8),
  home_longitude DECIMAL(11, 8),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  
  -- Limits
  monthly_limit DECIMAL(15, 2) DEFAULT 100000,
  current_month_spend DECIMAL(15, 2) DEFAULT 0,
  
  -- Behavior tracking
  last_30_transactions JSONB DEFAULT '[]',  -- Array of last 30 valid transactions
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `transactions`
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  transaction_type INTEGER NOT NULL,
  transaction_status INTEGER NOT NULL,
  transaction_timestamp TIMESTAMP NOT NULL,
  
  amount_value DECIMAL(15, 2) NOT NULL,
  amount_currency VARCHAR(10) DEFAULT 'INR',
  
  -- Sender info
  sender_customer_id VARCHAR(255) NOT NULL,
  sender_account_id VARCHAR(255) NOT NULL,
  sender_account_type INTEGER,
  sender_kyc_status INTEGER,
  sender_account_age_days INTEGER,
  sender_state VARCHAR(100),
  sender_city VARCHAR(100),
  sender_txn_count_1min INTEGER,
  sender_txn_count_10min INTEGER,
  sender_amount_24hr DECIMAL(15, 2),
  
  -- Device info
  device_type INTEGER,
  device_os INTEGER,
  app_version VARCHAR(50),
  ip_risk INTEGER,
  
  -- Receiver info
  receiver_type INTEGER,
  receiver_bank VARCHAR(100),
  merchant_category INTEGER,
  merchant_risk_level INTEGER,
  
  -- Payment info
  payment_method INTEGER,
  authorization_type INTEGER,
  
  -- Fraud detection results
  is_fraud INTEGER NOT NULL,
  risk_score DECIMAL(5, 4),
  fraud_reason_unusual_amount INTEGER DEFAULT 0,
  fraud_reason_geo_distance_anomaly INTEGER DEFAULT 0,
  fraud_reason_high_velocity INTEGER DEFAULT 0,
  fraud_severity INTEGER,
  flag_color INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sender_customer_id ON transactions(sender_customer_id);
CREATE INDEX idx_transaction_timestamp ON transactions(transaction_timestamp);
CREATE INDEX idx_is_fraud ON transactions(is_fraud);
```

---

## 4. gRPC Setup

### Proto File: `proto/fraud_detection.proto`
```protobuf
syntax = "proto3";

package fraud_detection;

service FraudDetectionService {
  rpc DetectFraud (TransactionRequest) returns (FraudResponse);
}

message TransactionRequest {
  string transaction_id = 1;
  int32 transaction_type = 2;
  string transaction_timestamp = 3;
  double amount_value = 4;
  string amount_currency = 5;
  
  // Sender information
  string sender_customer_id = 6;
  string sender_account_id = 7;
  int32 sender_account_type = 8;
  int32 sender_kyc_status = 9;
  int32 sender_account_age_days = 10;
  string sender_state = 11;
  string sender_city = 12;
  int32 sender_txn_count_1min = 13;
  int32 sender_txn_count_10min = 14;
  double sender_amount_24hr = 15;
  
  // Device information
  int32 device_type = 16;
  int32 device_os = 17;
  string app_version = 18;
  int32 ip_risk = 19;
  
  // Receiver information
  int32 receiver_type = 20;
  string receiver_bank = 21;
  int32 merchant_category = 22;
  int32 merchant_risk_level = 23;
  
  // Payment information
  int32 payment_method = 24;
  int32 authorization_type = 25;
  
  // Additional calculated metrics
  double geo_distance_km = 26;
  int32 transaction_velocity = 27;
  double amount_deviation = 28;
}

message FraudResponse {
  int32 is_fraud = 1;                          // 0=false, 1=true
  double risk_score = 2;                       // 0.0 to 1.0
  int32 fraud_reason_unusual_amount = 3;       // 0=false, 1=true
  int32 fraud_reason_geo_distance_anomaly = 4; // 0=false, 1=true
  int32 fraud_reason_high_velocity = 5;        // 0=false, 1=true
  int32 fraud_severity = 6;                    // 0=LOW, 1=MEDIUM, 2=HIGH
  int32 flag_color = 7;                        // 0=GREEN, 1=RED
  string model_version = 8;
}
```

---

## 5. Python gRPC Server

### File: `python-ml-service/server.py`
```python
import grpc
from concurrent import futures
import fraud_detection_pb2
import fraud_detection_pb2_grpc

class FraudDetectionService(fraud_detection_pb2_grpc.FraudDetectionServiceServicer):
    def DetectFraud(self, request, context):
        # PLACEHOLDER: ML model prediction
        # TODO: Replace with actual ML model
        
        # Extract features from request
        features = {
            'amount': request.amount_value,
            'txn_count_1min': request.sender_txn_count_1min,
            'txn_count_10min': request.sender_txn_count_10min,
            'amount_24hr': request.sender_amount_24hr,
            'geo_distance': request.geo_distance_km,
            'velocity': request.transaction_velocity,
            # ... more features
        }
        
        # PLACEHOLDER: Call ML model
        prediction = self.predict_fraud(features)
        
        return fraud_detection_pb2.FraudResponse(
            is_fraud=prediction['is_fraud'],
            risk_score=prediction['risk_score'],
            fraud_reason_unusual_amount=prediction['unusual_amount'],
            fraud_reason_geo_distance_anomaly=prediction['geo_anomaly'],
            fraud_reason_high_velocity=prediction['high_velocity'],
            fraud_severity=prediction['severity'],
            flag_color=prediction['flag_color'],
            model_version="v1.0.0"
        )
    
    def predict_fraud(self, features):
        # PLACEHOLDER: Replace with actual ML model
        # For now, simple rule-based logic
        
        is_fraud = 0
        risk_score = 0.0
        
        # Simple rules for demonstration
        if features['amount'] > 50000:
            risk_score += 0.3
        if features['txn_count_1min'] >= 5:
            risk_score += 0.4
        if features['geo_distance'] > 500:
            risk_score += 0.3
            
        is_fraud = 1 if risk_score >= 0.65 else 0
        
        return {
            'is_fraud': is_fraud,
            'risk_score': min(risk_score, 1.0),
            'unusual_amount': 1 if features['amount'] > 50000 else 0,
            'geo_anomaly': 1 if features['geo_distance'] > 500 else 0,
            'high_velocity': 1 if features['txn_count_1min'] >= 5 else 0,
            'severity': 2 if risk_score >= 0.8 else (1 if risk_score >= 0.5 else 0),
            'flag_color': 1 if is_fraud else 0
        }

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    fraud_detection_pb2_grpc.add_FraudDetectionServiceServicer_to_server(
        FraudDetectionService(), server
    )
    server.add_insecure_port('[::]:50051')
    server.start()
    print("gRPC server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

---

## 6. Backend Implementation Structure

### Files to Create:

```
backend/
├── proto/
│   └── fraud_detection.proto
├── grpc/
│   └── fraud-client.js          # gRPC client for Node.js
├── repositories/
│   ├── transaction.repository.js
│   └── user-profile.repository.js
├── services/
│   ├── fraud-detection.service.js
│   └── transaction.service.js
├── controllers/
│   ├── transaction.controller.js
│   └── generator.controller.js
├── routes/
│   └── transaction.routes.js
├── utils/
│   ├── geo-calculator.js        # Calculate geographic distance
│   ├── transaction-analyzer.js  # Analyze transaction patterns
│   └── hard-limits.js           # Check hard limits
└── prisma/
    └── schema.prisma            # Update with new tables
```

---

## 7. WebSocket Broadcast Format

### Event: `fraud-alert`
```json
{
  "transaction_id": "TXN123456",
  "timestamp": "2024-02-03T10:30:00Z",
  "amount_value": 75000,
  "sender_state": "Maharashtra",
  "sender_city": "Mumbai",
  "receiver_type": "MERCHANT",
  "merchant_category": "ELECTRONICS",
  "risk_score": 0.85,
  "fraud_severity": "HIGH",
  "flag_color": "RED",
  "fraud_reasons": [
    "unusual_amount",
    "high_velocity"
  ]
}
```

**DO NOT INCLUDE**:
- Account IDs
- Customer IDs
- Bank details
- Personal identifiable information
- Device details

---

## 8. Implementation Steps

1. **Update Prisma Schema** - Add user_profiles and transactions tables
2. **Create Proto File** - Define gRPC contract
3. **Setup Python gRPC Server** - Create ML service placeholder
4. **Create gRPC Client** - Node.js client to call Python service
5. **Create Repositories** - Database access layer
6. **Create Services** - Business logic for fraud detection
7. **Create Controllers** - API endpoints
8. **Create Routes** - Register endpoints
9. **Update WebSocket** - Add fraud alert broadcasting
10. **Test End-to-End** - Generate → Process → Detect → Store → Broadcast

---

## 9. Hard Limits Configuration

```javascript
const HARD_LIMITS = {
  MAX_TXN_PER_1MIN: 3,
  MAX_TXN_PER_10MIN: 10,
  MAX_AMOUNT_24HR: 200000,  // INR
  MAX_SINGLE_TXN: 100000,   // INR
  MAX_MONTHLY_LIMIT: 500000 // INR (can be user-specific)
}
```

---

## 10. Success Response Format

### POST /api/transactions/process
```json
{
  "success": true,
  "transaction_id": "TXN123456",
  "is_fraud": 0,
  "risk_score": 0.25,
  "flag_color": "GREEN",
  "message": "Transaction processed successfully"
}
```

### Fraud Detected Response
```json
{
  "success": true,
  "transaction_id": "TXN123456",
  "is_fraud": 1,
  "risk_score": 0.85,
  "fraud_severity": "HIGH",
  "flag_color": "RED",
  "fraud_reasons": [
    "unusual_amount",
    "high_velocity"
  ],
  "message": "Transaction flagged as fraudulent"
}
```
