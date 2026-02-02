# 🔄 User Name Data Flow

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  client_profiles                    fraud_transactions           │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │ customer_id      │              │ transaction_id   │        │
│  │ user_name ✨     │              │ sender_user_name ✨│       │
│  │ account_id       │              │ sender_customer_id│       │
│  │ city             │              │ amount_value     │        │
│  │ state            │              │ is_fraud         │        │
│  │ latitude         │              │ risk_score       │        │
│  │ longitude        │              │ ...              │        │
│  └──────────────────┘              └──────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ Prisma ORM
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│                    BACKEND (Express.js)                         │
├─────────────────────────────┴─────────────────────────────────┤
│                                                                  │
│  1. API Endpoint: POST /api/transactions/detect                 │
│     ┌────────────────────────────────────────────┐             │
│     │ Request Body (from client/CSV):            │             │
│     │ {                                          │             │
│     │   "transaction_id": "TXN_123",             │             │
│     │   "sender_customer_id": "CUST_IND_000001", │             │
│     │   "sender_user_name": "Rajesh Sharma", ✨  │             │
│     │   "amount_value": 7500,                    │             │
│     │   "sender_city": "Mumbai",                 │             │
│     │   "current_latitude": 19.0760,             │             │
│     │   "current_longitude": 72.8777,            │             │
│     │   ...                                      │             │
│     │ }                                          │             │
│     └────────────────────────────────────────────┘             │
│                              │                                   │
│                              ▼                                   │
│  2. Fraud Detection Service                                     │
│     ┌────────────────────────────────────────────┐             │
│     │ • Check static rules                       │             │
│     │ • Check behavioral anomalies               │             │
│     │ • Call ML model (gRPC)                     │             │
│     │ • Log to database (with user_name) ✨      │             │
│     └────────────────────────────────────────────┘             │
│                              │                                   │
│                              ▼                                   │
│  3. Response & Broadcast                                        │
│     ┌────────────────────────────────────────────┐             │
│     │ API Response:                              │             │
│     │ {                                          │             │
│     │   "transaction_id": "TXN_123",             │             │
│     │   "sender_user_name": "Rajesh Sharma", ✨  │             │
│     │   "is_fraud": false,                       │             │
│     │   "risk_score": 0.0,                       │             │
│     │   "flag_color": "GREEN"                    │             │
│     │ }                                          │             │
│     └────────────────────────────────────────────┘             │
│                              │                                   │
│                              ▼                                   │
│     ┌────────────────────────────────────────────┐             │
│     │ WebSocket Broadcast:                       │             │
│     │ Event: "real-time-stream"                  │             │
│     │ {                                          │             │
│     │   "transaction_id": "TXN_123",             │             │
│     │   "sender_user_name": "Rajesh Sharma", ✨  │             │
│     │   "amount_value": 7500,                    │             │
│     │   "sender_city": "Mumbai",                 │             │
│     │   "is_fraud": false,                       │             │
│     │   "flag_color": "GREEN"                    │             │
│     │ }                                          │             │
│     └────────────────────────────────────────────┘             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Response
                              │ WebSocket Event
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Dashboard Component                                             │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Real-Time Transaction Stream                      │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │ 👤 Rajesh Sharma ✨                          │ │         │
│  │  │ ID: CUST_IND_000001                          │ │         │
│  │  │ Amount: ₹7,500                               │ │         │
│  │  │ Location: Mumbai, Maharashtra                │ │         │
│  │  │ Status: ✅ APPROVED                          │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │ 👤 Priya Patel ✨                            │ │         │
│  │  │ ID: CUST_IND_000002                          │ │         │
│  │  │ Amount: ₹150,000                             │ │         │
│  │  │ Location: Delhi, Delhi                       │ │         │
│  │  │ Status: 🚨 FRAUD DETECTED                    │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Sources

### 1. Test Data (CSV)
```
Data Sample/test_transactions.csv
├── 100 transactions
├── Each has sender_user_name ✨
├── Each has coordinates
└── 85 normal, 15 fraud
```

### 2. Client Profiles (Database)
```
client_profiles table
├── 20 profiles
├── Each has user_name ✨
├── Indian names (Rajesh Sharma, Priya Patel, etc.)
└── Geographic data (city, state, lat, lon)
```

---

## 📤 Output Channels

### 1. API Response
```json
{
  "success": true,
  "transaction_id": "TXN_123",
  "sender_user_name": "Rajesh Sharma", ✨
  "is_fraud": false,
  "risk_score": 0.0,
  "fraud_severity": "LOW",
  "flag_color": "GREEN"
}
```

### 2. WebSocket Event
```json
{
  "transaction_id": "TXN_123",
  "sender_user_name": "Rajesh Sharma", ✨
  "timestamp": "2024-02-03T14:30:00.000Z",
  "amount_value": 7500,
  "sender_city": "Mumbai",
  "sender_state": "Maharashtra",
  "is_fraud": false,
  "risk_score": 0.0,
  "flag_color": "GREEN"
}
```

### 3. Database Record
```sql
INSERT INTO fraud_transactions (
  transaction_id,
  sender_customer_id,
  sender_user_name, ✨
  amount_value,
  is_fraud,
  risk_score,
  ...
) VALUES (
  'TXN_123',
  'CUST_IND_000001',
  'Rajesh Sharma', ✨
  7500,
  false,
  0.0,
  ...
);
```

---

## 🎯 User Name Journey

```
1. SEED DATA
   ├── seed-client-profiles.js
   │   └── Creates 20 profiles with names
   │       ├── Rajesh Sharma (Mumbai)
   │       ├── Priya Patel (Delhi)
   │       └── ... (18 more)
   │
2. GENERATE TRANSACTIONS
   ├── generate-transactions-csv.js
   │   └── Creates 100 transactions
   │       └── Each includes sender_user_name from profile
   │
3. TEST TRANSACTION
   ├── Python script reads CSV
   │   └── Sends transaction to API
   │       └── Includes sender_user_name
   │
4. FRAUD DETECTION
   ├── Backend receives transaction
   │   ├── Checks fraud rules
   │   ├── Logs to database (with user_name)
   │   └── Returns result (with user_name)
   │
5. BROADCAST
   ├── WebSocket emits event
   │   └── Includes sender_user_name
   │
6. DISPLAY
   └── Frontend shows transaction
       └── Displays user name prominently
```

---

## 🔍 Where User Names Appear

### Backend
- ✅ `ClientProfile` model (database)
- ✅ `FraudTransaction` model (database)
- ✅ Fraud detection service (logging)
- ✅ API response (JSON)
- ✅ WebSocket event (JSON)

### Data Files
- ✅ `test_transactions.csv` (column: sender_user_name)
- ✅ `test-with-username.json` (field: sender_user_name)

### Testing
- ✅ Python script output (displays name)
- ✅ Prisma Studio (shows in table)

### Frontend (Ready)
- ✅ Real-time transaction stream
- ✅ Transaction history table
- ✅ Fraud alerts
- ✅ User profile cards

---

## 📊 Sample Data Flow

### Example 1: Normal Transaction

```
INPUT (CSV/API):
{
  "sender_customer_id": "CUST_IND_000001",
  "sender_user_name": "Rajesh Sharma",
  "amount_value": 7500,
  "current_latitude": 19.0760,
  "current_longitude": 72.8777
}
        ↓
FRAUD DETECTION:
✅ Static rules: PASS
✅ Behavioral: PASS
✅ ML model: PASS
        ↓
DATABASE:
fraud_transactions table:
  sender_user_name: "Rajesh Sharma"
  is_fraud: false
  risk_score: 0.0
        ↓
OUTPUT (API):
{
  "sender_user_name": "Rajesh Sharma",
  "is_fraud": false,
  "flag_color": "GREEN"
}
        ↓
WEBSOCKET:
{
  "sender_user_name": "Rajesh Sharma",
  "is_fraud": false
}
        ↓
FRONTEND:
┌─────────────────────────┐
│ 👤 Rajesh Sharma        │
│ ₹7,500                  │
│ Mumbai, Maharashtra     │
│ ✅ APPROVED             │
└─────────────────────────┘
```

### Example 2: Fraud Transaction

```
INPUT (CSV/API):
{
  "sender_customer_id": "CUST_IND_000009",
  "sender_user_name": "Arjun Mehta",
  "amount_value": 175000,
  "current_latitude": 26.9124,
  "current_longitude": 75.7873
}
        ↓
FRAUD DETECTION:
❌ Static rules: FAIL (amount > 100k)
        ↓
DATABASE:
fraud_transactions table:
  sender_user_name: "Arjun Mehta"
  is_fraud: true
  risk_score: 1.0
  reason_of_fraud: "Amount exceeds limit"
        ↓
OUTPUT (API):
{
  "sender_user_name": "Arjun Mehta",
  "is_fraud": true,
  "flag_color": "RED",
  "fraud_severity": "HIGH"
}
        ↓
WEBSOCKET:
{
  "sender_user_name": "Arjun Mehta",
  "is_fraud": true,
  "flag_color": "RED"
}
        ↓
FRONTEND:
┌─────────────────────────┐
│ 👤 Arjun Mehta          │
│ ₹175,000                │
│ Jaipur, Rajasthan       │
│ 🚨 FRAUD DETECTED       │
└─────────────────────────┘
```

---

## ✨ Key Benefits

1. **Better User Experience**
   - See actual names instead of just IDs
   - More human-readable alerts
   - Easier to identify customers

2. **Improved Debugging**
   - Trace transactions by name
   - Easier to verify test data
   - Better logs and reports

3. **Frontend Ready**
   - All data includes names
   - No additional API calls needed
   - Real-time updates with names

4. **Complete Integration**
   - Database stores names
   - API returns names
   - WebSocket broadcasts names
   - Frontend displays names

---

## 🎯 Summary

User names flow through the entire system:

**Database** → **Backend** → **API** → **WebSocket** → **Frontend**

Every transaction now includes the customer's name, making the system more user-friendly and easier to understand! 🚀
