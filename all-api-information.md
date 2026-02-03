# All API Endpoints Documentation

## Base URL
```
http://localhost:5000
```

---

## 1. Health Check

### `GET /api/health`

Check if server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## 2. Fraud Detection

### `POST /api/transactions/detect`

Process a transaction and detect fraud in real-time.

**Request:**
```json
{
  "transaction_id": "TXN_001",
  "transaction_type": "PAYMENT",
  "transaction_status": "SUCCESS",
  "transaction_timestamp": "2026-02-03T07:20:00.000Z",
  "amount_value": 45000,
  "amount_currency": "INR",
  "sender_customer_id": "CUST_IND_000001",
  "sender_user_name": "Rajesh Sharma",
  "sender_account_id": "ACC_IND_000000001",
  "sender_account_type": "SAVINGS",
  "sender_kyc_status": "FULL_KYC",
  "sender_account_age_days": 730,
  "sender_state": "Maharashtra",
  "sender_city": "Mumbai",
  "current_latitude": 19.0760,
  "current_longitude": 72.8777,
  "sender_txn_count_1min": 1,
  "sender_txn_count_10min": 2,
  "sender_amount_24hr": 15000,
  "device_type": "MOBILE",
  "device_os": "Android",
  "app_version": "2.1.0",
  "ip_risk": "LOW",
  "receiver_type": "MERCHANT",
  "receiver_bank": "HDFC Bank",
  "merchant_category": "Electronics",
  "merchant_risk_level": "MEDIUM",
  "payment_method": "Card",
  "authorization_type": "PIN"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "transaction_id": "TXN_001",
    "transaction_type": "PAYMENT",
    "transaction_status": "SUCCESS",
    "transaction_timestamp": "2026-02-03T07:20:00.000Z",
    "amount_value": 45000,
    "amount_currency": "INR",
    "payment_method": "Card",
    "authorization_type": "PIN"
  },
  "sender": {
    "customer_id": "CUST_IND_000001",
    "user_name": "Rajesh Sharma",
    "account_id": "ACC_IND_000000001",
    "account_type": "SAVINGS",
    "kyc_status": "FULL_KYC",
    "account_age_days": 730,
    "state": "Maharashtra",
    "city": "Mumbai",
    "current_latitude": 19.076,
    "current_longitude": 72.8777,
    "txn_count_1min": 1,
    "txn_count_10min": 2,
    "amount_24hr": 15000
  },
  "device": {
    "device_type": "MOBILE",
    "device_os": "Android",
    "app_version": "2.1.0",
    "ip_risk": "LOW"
  },
  "receiver": {
    "receiver_type": "MERCHANT",
    "receiver_bank": "HDFC Bank",
    "merchant_category": "Electronics",
    "merchant_risk_level": "MEDIUM"
  },
  "fraud": {
    "is_fraud": true,
    "risk_score": 0.65,
    "fraud_severity": "MEDIUM",
    "flag_color": "ORANGE",
    "reason_of_fraud": "Spending spike detected",
    "detection_method": "BEHAVIORAL_ANALYSIS",
    "reasons": {
      "unusual_amount": true,
      "geo_distance_anomaly": false,
      "high_velocity": false
    }
  },
  "profile": {
    "customer_id": "CUST_IND_000001",
    "account_id": "ACC_IND_000000001",
    "user_name": "Rajesh Sharma",
    "account_type": "SAVINGS",
    "monthly_limit": 100000,
    "current_month_spend": 25000,
    "flagged_score": 15,
    "transaction_history_count": 30
  },
  "analysis": {
    "amount_anomaly": { "isAnomaly": true, "zScore": 2.5 },
    "spending_spike": { "isSpike": true, "spikeRatio": 2.3 },
    "geo_distance": null
  },
  "metadata": {
    "processed_at": "2026-02-03T01:51:28.844Z",
    "detection_method": "BEHAVIORAL_ANALYSIS"
  }
}
```

---

### `GET /api/transactions/recent`

Fetch recent transactions for initial dashboard load.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)

**Request:**
```
GET /api/transactions/recent?limit=5
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "transactions": [
    {
      "transaction": { ... },
      "sender": { ... },
      "device": { ... },
      "receiver": { ... },
      "fraud": { ... },
      "profile": { ... },
      "analysis": null,
      "metadata": {
        "processed_at": "2026-02-03T01:51:43.846Z",
        "detection_method": "HISTORICAL"
      }
    }
  ]
}
```

---

### `GET /api/transactions/user/:customerId`

Fetch all transactions for a specific user/customer.

**Path Parameters:**
- `customerId` (required): Customer ID to fetch transactions for

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 25)

**Request:**
```
GET /api/transactions/user/CUST_IND_000001?limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "customer_id": "CUST_IND_000001",
  "transactions": [
    {
      "transaction": {
        "transaction_id": "TXN_ML_TEST_001",
        "transaction_type": "PAYMENT",
        "transaction_status": "SUCCESS",
        "transaction_timestamp": "2026-02-03T07:20:00.000Z",
        "amount_value": 45000,
        "amount_currency": "INR",
        "payment_method": "Card",
        "authorization_type": "PIN"
      },
      "sender": {
        "customer_id": "CUST_IND_000001",
        "user_name": "Rajesh Sharma",
        "account_id": "ACC_IND_000000001",
        "account_type": "SAVINGS",
        "kyc_status": "FULL_KYC",
        "account_age_days": 730,
        "state": "Maharashtra",
        "city": "Mumbai",
        "current_latitude": 19.076,
        "current_longitude": 72.8777,
        "txn_count_1min": 1,
        "txn_count_10min": 2,
        "amount_24hr": 15000
      },
      "device": {
        "device_type": "MOBILE",
        "device_os": "Android",
        "app_version": "2.1.0",
        "ip_risk": "LOW"
      },
      "receiver": {
        "receiver_type": "MERCHANT",
        "receiver_bank": "HDFC Bank",
        "merchant_category": "Electronics",
        "merchant_risk_level": "MEDIUM"
      },
      "fraud": {
        "is_fraud": true,
        "risk_score": 0.4,
        "fraud_severity": "MEDIUM",
        "flag_color": "RED",
        "reason_of_fraud": "Amount ₹45000 is 10.3 std deviations from average ₹8986",
        "detection_method": "HISTORICAL",
        "reasons": {
          "unusual_amount": true,
          "geo_distance_anomaly": false,
          "high_velocity": false
        }
      },
      "profile": {
        "customer_id": "CUST_IND_000001",
        "account_id": "ACC_IND_000000001",
        "user_name": "Rajesh Sharma",
        "account_type": "SAVINGS",
        "account_age_days": 1941,
        "kyc_status": "FULL_KYC",
        "state": "Maharashtra",
        "city": "Mumbai",
        "latitude": 19.076,
        "longitude": 72.8777,
        "monthly_limit": 500000,
        "current_month_spend": 155781,
        "flagged_score": 15,
        "transaction_history_count": 28
      },
      "analysis": null,
      "metadata": {
        "processed_at": "2026-02-03T01:51:28.536Z",
        "detection_method": "HISTORICAL"
      }
    }
  ]
}
```

---

## 3. Analytics Endpoints

### `GET /api/analytics/summary`

Get today's and month's statistics overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "totalTransactions": 150,
      "flaggedTransactions": 45,
      "openAlerts": 45,
      "fraudDetectionRate": 30.0,
      "avgRiskScore": 42.5,
      "lossesPrevented": 125000,
      "totalAmount": 1500000
    },
    "month": {
      "totalTransactions": 4500,
      "flaggedTransactions": 890,
      "totalAmount": 15000000,
      "flaggedAmount": 2500000,
      "lossesPrevented": 2500000
    },
    "overall": {
      "avgRiskScore": 35.2,
      "fraudCasesLast30Days": 892
    }
  }
}
```

---

### `GET /api/analytics/trends`

Get 30-day daily transaction and fraud trend data.

**Response:**
```json
{
  "success": true,
  "data": {
    "last30Days": [
      { "date": "2026-01-04", "total": 150, "flagged": 35, "amount": 1500000 },
      { "date": "2026-01-05", "total": 180, "flagged": 42, "amount": 1800000 }
    ],
    "summary": {
      "totalTransactions": 4500,
      "totalFlagged": 890,
      "totalAmount": 45000000
    }
  }
}
```

---

### `GET /api/analytics/hourly`

Get today's hourly transaction volume and peak fraud hours.

**Response:**
```json
{
  "success": true,
  "data": {
    "hourlyVolume": [0, 0, 0, 0, 2, 1, 0, 3, 5, 8, 12, 15, 18, 20, 22, 25, 20, 15, 10, 8, 5, 3, 2, 1],
    "hourlyFraudCount": [0, 0, 0, 0, 1, 0, 0, 2, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0],
    "hourlyAmount": [0, 0, 0, 0, 25000, 15000, 0, 45000, 80000, ...],
    "peakFraudHours": [7, 5, 4]
  }
}
```

---

### `GET /api/analytics/full`

Get all analytics data in one call.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": { ... },
    "trends": { ... },
    "hourly": { ... }
  }
}
```

---

## 4. ML Model API (External)

### `POST http://localhost:8000/score_dict`

External ML model endpoint for fraud scoring.

**Request:**
```json
{
  "transaction": {
    "amount": 45000,
    "Transaction_Amount_Deviation": 80,
    "Transaction_Frequency": 2,
    "Days_Since_Last_Transaction": 30,
    "Date": "2026-02-03",
    "Time": "01:45:00",
    "Transaction_Status": "Failed",
    "Transaction_Type": "Card",
    "Device_OS": "Android",
    "Merchant_Category": "Electronics",
    "Merchant_Risk_Level": 4
  }
}
```

**Response:**
```json
{
  "features": [45000.0, 1, 80.0, 30.0, 3, 2, 1, 1, ...],
  "iso_score": 0.621,
  "rf_proba": 0.432,
  "xgb_proba": 0.114,
  "ensemble_score": 0.333,
  "is_flagged": false,
  "confidence": 0.621,
  "severity": "MEDIUM",
  "recommended_action": "Review & Verify"
}
```

---

## 5. Socket.IO Real-Time Events

### Connection Details

| Property | Value |
|----------|-------|
| **URL** | `http://localhost:5000` |
| **Protocol** | WebSocket (Socket.IO) |
| **Auto Reconnect** | Yes (5 attempts) |
| **Reconnect Delay** | 1000ms |

### Client Setup (JavaScript)

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000', {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
})

// Connection events
socket.on('connect', () => {
    console.log('🔌 Connected:', socket.id)
})

socket.on('disconnect', () => {
    console.log('🔌 Disconnected')
})

socket.on('connect_error', (error) => {
    console.error('🔌 Connection error:', error.message)
})
```

---

### Event: `real-time-stream`

**Triggered:** After every `POST /api/transactions/detect` call

**Direction:** Server → Client (broadcast to all connected clients)

**Listen:**
```javascript
socket.on('real-time-stream', (data) => {
    console.log('New transaction:', data)
    
    // Access fraud result
    if (data.fraud.is_fraud) {
        console.log('⚠️ FRAUD DETECTED:', data.fraud.reason_of_fraud)
    }
})
```

**Payload Structure:**
```json
{
  "transaction": {
    "transaction_id": "TXN_001",
    "transaction_type": "PAYMENT",
    "transaction_status": "SUCCESS",
    "transaction_timestamp": "2026-02-03T07:20:00.000Z",
    "amount_value": 45000,
    "amount_currency": "INR",
    "payment_method": "Card",
    "authorization_type": "PIN"
  },
  "sender": {
    "customer_id": "CUST_IND_000001",
    "user_name": "Rajesh Sharma",
    "account_id": "ACC_IND_000000001",
    "account_type": "SAVINGS",
    "kyc_status": "FULL_KYC",
    "account_age_days": 730,
    "state": "Maharashtra",
    "city": "Mumbai",
    "current_latitude": 19.076,
    "current_longitude": 72.8777,
    "txn_count_1min": 1,
    "txn_count_10min": 2,
    "amount_24hr": 15000
  },
  "device": {
    "device_type": "MOBILE",
    "device_os": "Android",
    "app_version": "2.1.0",
    "ip_risk": "LOW"
  },
  "receiver": {
    "receiver_type": "MERCHANT",
    "receiver_bank": "HDFC Bank",
    "merchant_category": "Electronics",
    "merchant_risk_level": "MEDIUM"
  },
  "fraud": {
    "is_fraud": true,
    "risk_score": 0.65,
    "fraud_severity": "MEDIUM",
    "flag_color": "ORANGE",
    "reason_of_fraud": "Spending spike detected",
    "detection_method": "BEHAVIORAL_ANALYSIS",
    "reasons": {
      "unusual_amount": true,
      "geo_distance_anomaly": false,
      "high_velocity": false
    }
  },
  "profile": {
    "customer_id": "CUST_IND_000001",
    "user_name": "Rajesh Sharma",
    "monthly_limit": 100000,
    "current_month_spend": 25000,
    "flagged_score": 15,
    "transaction_history_count": 30
  },
  "analysis": {
    "amount_anomaly": { "isAnomaly": true, "zScore": 2.5, "severity": "MEDIUM" },
    "repeated_pattern": { "isPattern": false },
    "spending_spike": { "isSpike": true, "spikeRatio": 2.3 },
    "geo_distance": { "distance": 5.2, "maxAllowed": 100 }
  },
  "metadata": {
    "processed_at": "2026-02-03T01:51:28.844Z",
    "detection_method": "BEHAVIORAL_ANALYSIS"
  }
}
```

---

### React Integration Example

```jsx
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export function useRealTimeTransactions() {
    const [transactions, setTransactions] = useState([])
    
    useEffect(() => {
        const socket = io('http://localhost:5000')
        
        socket.on('real-time-stream', (data) => {
            setTransactions(prev => [data, ...prev].slice(0, 50))
        })
        
        return () => socket.disconnect()
    }, [])
    
    return transactions
}
```

---

## Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```
