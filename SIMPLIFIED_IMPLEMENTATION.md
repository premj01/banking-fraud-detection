# Simplified Fraud Detection Implementation

## Flow Overview

```
1. WebSocket Server (real-time-stream event)
2. POST /api/transactions/detect endpoint
3. Step 3.1: Static Banking Rules (hard limits)
   → If fraud detected → Log to DB → Send to WebSocket → STOP
4. Step 3.2: Fetch user data & check behavioral anomalies
   → If fraud detected → Log to DB → Update user data → Send to WebSocket → STOP
5. Step 4: Call gRPC ML Model
   → Log to DB → Update user data → Send to WebSocket
```

## Input Format (Text Values, Not Numeric)

```json
{
  "transaction_id": "TXN123",
  "transaction_type": "TRANSFER" | "PAYMENT",
  "transaction_status": "SUCCESS",
  "transaction_timestamp": "2024-07-28T09:47:32Z",
  "amount_value": 7500.89,
  "amount_currency": "INR",
  
  "sender_customer_id": "CUST123",
  "sender_account_id": "ACC123",
  "sender_account_type": "SAVINGS" | "CURRENT",
  "sender_kyc_status": "MIN_KYC" | "FULL_KYC",
  "sender_account_age_days": 1850,
  "sender_state": "Maharashtra",
  "sender_city": "Mumbai",
  "sender_txn_count_1min": 1,
  "sender_txn_count_10min": 3,
  "sender_amount_24hr": 10500.25,
  
  "device_type": "MOBILE" | "WEB",
  "device_os": "Android" | "iOS" | "Windows",
  "app_version": "2.1.0",
  "ip_risk": "LOW" | "MEDIUM" | "HIGH",
  
  "receiver_type": "PERSON" | "MERCHANT",
  "receiver_bank": "HDFC Bank",
  "merchant_category": "FOOD" | "ELECTRONICS" | "TRAVEL" | "HEALTH" | "UTILITIES" | "ENTERTAINMENT" | "SHOPPING" | "EDUCATION",
  "merchant_risk_level": "LOW" | "MEDIUM" | "HIGH",
  
  "payment_method": "UPI" | "CARD" | "NETBANKING",
  "authorization_type": "PIN" | "OTP" | "BIOMETRIC"
}
```

## Output Format (Added Fraud Fields)

```json
{
  "success": true,
  "transaction_id": "TXN123",
  "is_fraud": true | false,
  "risk_score": 0.85,
  "fraud_reason_unusual_amount": true | false,
  "fraud_reason_geo_distance_anomaly": true | false,
  "fraud_reason_high_velocity": true | false,
  "fraud_severity": "LOW" | "MEDIUM" | "HIGH",
  "flag_color": "GREEN" | "RED",
  "reason_of_fraud": "Amount exceeds single transaction limit of 100,000 INR"
}
```

---

## Implementation Steps

### STEP 1: Update Prisma Schema

Add ClientProfile table for sender/receiver data:

```prisma
model ClientProfile {
  id                    String   @id @default(cuid())
  customerId            String   @unique @map("customer_id")
  accountId             String   @unique @map("account_id")
  accountType           String   @map("account_type")  // SAVINGS, CURRENT
  accountAgeDays        Int      @map("account_age_days")
  accountCreatedAt      DateTime @map("account_created_at")
  kycStatus             String   @map("kyc_status")  // MIN_KYC, FULL_KYC
  
  // Geographic data
  state                 String?
  city                  String?
  latitude              Float?
  longitude             Float?
  
  // Limits and spending
  monthlyLimit          Float    @default(100000) @map("monthly_limit")
  currentMonthSpend     Float    @default(0) @map("current_month_spend")
  
  // Last 30 valid transactions
  last30Transactions    Json     @default("[]") @map("last_30_transactions")
  
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("client_profiles")
}

model FraudTransaction {
  id                              String   @id @default(cuid())
  transactionId                   String   @unique @map("transaction_id")
  transactionType                 String   @map("transaction_type")
  transactionStatus               String   @map("transaction_status")
  transactionTimestamp            DateTime @map("transaction_timestamp")
  
  amountValue                     Float    @map("amount_value")
  amountCurrency                  String   @default("INR") @map("amount_currency")
  
  senderCustomerId                String   @map("sender_customer_id")
  senderAccountId                 String   @map("sender_account_id")
  senderAccountType               String?  @map("sender_account_type")
  senderKycStatus                 String?  @map("sender_kyc_status")
  senderAccountAgeDays            Int?     @map("sender_account_age_days")
  senderState                     String?  @map("sender_state")
  senderCity                      String?  @map("sender_city")
  senderTxnCount1min              Int?     @map("sender_txn_count_1min")
  senderTxnCount10min             Int?     @map("sender_txn_count_10min")
  senderAmount24hr                Float?   @map("sender_amount_24hr")
  
  deviceType                      String?  @map("device_type")
  deviceOs                        String?  @map("device_os")
  appVersion                      String?  @map("app_version")
  ipRisk                          String?  @map("ip_risk")
  
  receiverType                    String?  @map("receiver_type")
  receiverBank                    String?  @map("receiver_bank")
  merchantCategory                String?  @map("merchant_category")
  merchantRiskLevel               String?  @map("merchant_risk_level")
  
  paymentMethod                   String?  @map("payment_method")
  authorizationType               String?  @map("authorization_type")
  
  // Fraud detection results
  isFraud                         Boolean  @map("is_fraud")
  riskScore                       Float?   @map("risk_score")
  fraudReasonUnusualAmount        Boolean  @default(false) @map("fraud_reason_unusual_amount")
  fraudReasonGeoDistanceAnomaly   Boolean  @default(false) @map("fraud_reason_geo_distance_anomaly")
  fraudReasonHighVelocity         Boolean  @default(false) @map("fraud_reason_high_velocity")
  fraudSeverity                   String?  @map("fraud_severity")
  flagColor                       String?  @map("flag_color")
  reasonOfFraud                   String?  @map("reason_of_fraud")
  
  createdAt                       DateTime @default(now()) @map("created_at")

  @@index([senderCustomerId])
  @@index([transactionTimestamp])
  @@index([isFraud])
  @@map("fraud_transactions")
}
```

Run:
```bash
cd backend
npm run prisma:push
npm run prisma:generate
```

---

### STEP 2: Install gRPC Dependencies

```bash
cd backend
npm install @grpc/grpc-js @grpc/proto-loader
```

---

### STEP 3: Create Proto File

**File**: `proto/fraud_detection.proto`

```protobuf
syntax = "proto3";

package fraud_detection;

service FraudDetectionService {
  rpc DetectFraud (TransactionRequest) returns (FraudResponse);
}

message TransactionRequest {
  string transaction_id = 1;
  string transaction_type = 2;
  string transaction_timestamp = 3;
  double amount_value = 4;
  string amount_currency = 5;
  
  string sender_customer_id = 6;
  string sender_account_id = 7;
  string sender_account_type = 8;
  string sender_kyc_status = 9;
  int32 sender_account_age_days = 10;
  string sender_state = 11;
  string sender_city = 12;
  int32 sender_txn_count_1min = 13;
  int32 sender_txn_count_10min = 14;
  double sender_amount_24hr = 15;
  
  string device_type = 16;
  string device_os = 17;
  string app_version = 18;
  string ip_risk = 19;
  
  string receiver_type = 20;
  string receiver_bank = 21;
  string merchant_category = 22;
  string merchant_risk_level = 23;
  
  string payment_method = 24;
  string authorization_type = 25;
}

message FraudResponse {
  bool is_fraud = 1;
  double risk_score = 2;
  bool fraud_reason_unusual_amount = 3;
  bool fraud_reason_geo_distance_anomaly = 4;
  bool fraud_reason_high_velocity = 5;
  string fraud_severity = 6;
  string flag_color = 7;
  string reason_of_fraud = 8;
}
```

---

### STEP 4: Create Backend Files

**File**: `backend/config/fraud-rules.js`

```javascript
export const FRAUD_RULES = {
  MAX_SINGLE_TRANSACTION: 100000,
  MAX_TRANSACTIONS_1MIN: 3,
  MAX_TRANSACTIONS_10MIN: 10,
  MAX_AMOUNT_24HR: 200000,
  MAX_MONTHLY_LIMIT: 500000,
  HIGH_RISK_AMOUNT: 50000,
  SUSPICIOUS_VELOCITY: 5,
  MAX_GEO_DISTANCE_KM: 500
}
```

**File**: `backend/utils/geo-calculator.js`

```javascript
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0
  
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}
```

**File**: `backend/grpc/fraud-client.js`

```javascript
import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROTO_PATH = path.join(__dirname, '../../proto/fraud_detection.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
})

const fraudProto = grpc.loadPackageDefinition(packageDefinition).fraud_detection

class FraudDetectionClient {
  constructor() {
    this.client = new fraudProto.FraudDetectionService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    )
  }

  async detectFraud(transactionData) {
    return new Promise((resolve, reject) => {
      this.client.DetectFraud(transactionData, (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }
}

export default new FraudDetectionClient()
```

**File**: `backend/repositories/client-profile.repository.js`

```javascript
import prisma from '../lib/prisma.js'

export class ClientProfileRepository {
  async findByCustomerId(customerId) {
    return await prisma.clientProfile.findUnique({
      where: { customerId }
    })
  }

  async updateMonthlySpend(customerId, amount) {
    return await prisma.clientProfile.update({
      where: { customerId },
      data: {
        currentMonthSpend: { increment: amount }
      }
    })
  }

  async updateLast30Transactions(customerId, newTransaction) {
    const profile = await this.findByCustomerId(customerId)
    if (!profile) return null

    let transactions = profile.last30Transactions || []
    transactions.push(newTransaction)
    
    if (transactions.length > 30) {
      transactions.shift() // Remove oldest
    }

    return await prisma.clientProfile.update({
      where: { customerId },
      data: { last30Transactions: transactions }
    })
  }
}

export default new ClientProfileRepository()
```

**File**: `backend/repositories/fraud-transaction.repository.js`

```javascript
import prisma from '../lib/prisma.js'

export class FraudTransactionRepository {
  async create(data) {
    return await prisma.fraudTransaction.create({ data })
  }
}

export default new FraudTransactionRepository()
```

**File**: `backend/services/fraud-detection.service.js`

```javascript
import { FRAUD_RULES } from '../config/fraud-rules.js'
import clientProfileRepository from '../repositories/client-profile.repository.js'
import fraudTransactionRepository from '../repositories/fraud-transaction.repository.js'
import fraudClient from '../grpc/fraud-client.js'
import { calculateDistance } from '../utils/geo-calculator.js'

export class FraudDetectionService {
  
  // STEP 3.1: Static Banking Rules
  async checkStaticRules(txnData) {
    const violations = []
    
    // Rule 1: Single transaction limit
    if (txnData.amount_value > FRAUD_RULES.MAX_SINGLE_TRANSACTION) {
      violations.push(`Amount ${txnData.amount_value} exceeds single transaction limit of ${FRAUD_RULES.MAX_SINGLE_TRANSACTION} INR`)
    }
    
    // Rule 2: Transaction velocity (1 minute)
    if (txnData.sender_txn_count_1min > FRAUD_RULES.MAX_TRANSACTIONS_1MIN) {
      violations.push(`Transaction count in 1 minute (${txnData.sender_txn_count_1min}) exceeds limit of ${FRAUD_RULES.MAX_TRANSACTIONS_1MIN}`)
    }
    
    // Rule 3: Transaction velocity (10 minutes)
    if (txnData.sender_txn_count_10min > FRAUD_RULES.MAX_TRANSACTIONS_10MIN) {
      violations.push(`Transaction count in 10 minutes (${txnData.sender_txn_count_10min}) exceeds limit of ${FRAUD_RULES.MAX_TRANSACTIONS_10MIN}`)
    }
    
    // Rule 4: 24-hour amount limit
    if (txnData.sender_amount_24hr > FRAUD_RULES.MAX_AMOUNT_24HR) {
      violations.push(`24-hour transaction amount (${txnData.sender_amount_24hr}) exceeds limit of ${FRAUD_RULES.MAX_AMOUNT_24HR} INR`)
    }
    
    if (violations.length > 0) {
      return {
        is_fraud: true,
        risk_score: 1.0,
        fraud_reason_unusual_amount: txnData.amount_value > FRAUD_RULES.MAX_SINGLE_TRANSACTION,
        fraud_reason_high_velocity: txnData.sender_txn_count_1min > FRAUD_RULES.MAX_TRANSACTIONS_1MIN,
        fraud_reason_geo_distance_anomaly: false,
        fraud_severity: 'HIGH',
        flag_color: 'RED',
        reason_of_fraud: violations.join('; ')
      }
    }
    
    return null // No fraud detected
  }
  
  // STEP 3.2: Behavioral Anomalies (using user data)
  async checkBehavioralAnomalies(txnData) {
    // Fetch sender profile
    const senderProfile = await clientProfileRepository.findByCustomerId(
      txnData.sender_customer_id
    )
    
    if (!senderProfile) {
      return { profile: null, fraud: null } // Skip if no profile
    }
    
    const violations = []
    let riskScore = 0
    let fraudReasons = {
      unusual_amount: false,
      geo_anomaly: false,
      high_velocity: false
    }
    
    // Check 1: Monthly limit exceeded
    if (senderProfile.currentMonthSpend + txnData.amount_value > senderProfile.monthlyLimit) {
      violations.push(`Monthly limit exceeded: ${senderProfile.currentMonthSpend + txnData.amount_value} > ${senderProfile.monthlyLimit}`)
      riskScore += 0.4
      fraudReasons.unusual_amount = true
    }
    
    // Check 2: Amount deviation from typical transactions
    if (senderProfile.last30Transactions && senderProfile.last30Transactions.length > 0) {
      const avgAmount = senderProfile.last30Transactions.reduce((sum, t) => sum + t.amount, 0) / senderProfile.last30Transactions.length
      const deviation = Math.abs(txnData.amount_value - avgAmount) / avgAmount
      
      if (deviation > 3) { // 300% deviation
        violations.push(`Amount ${txnData.amount_value} deviates significantly from average ${avgAmount.toFixed(2)}`)
        riskScore += 0.3
        fraudReasons.unusual_amount = true
      }
    }
    
    // Check 3: Geographic anomaly
    if (senderProfile.latitude && senderProfile.longitude) {
      // Assuming current location is in sender_state/city (simplified)
      // In real scenario, you'd have current lat/lon in transaction data
      const distance = 0 // Placeholder - would calculate actual distance
      
      if (distance > FRAUD_RULES.MAX_GEO_DISTANCE_KM) {
        violations.push(`Geographic distance ${distance}km exceeds limit`)
        riskScore += 0.3
        fraudReasons.geo_anomaly = true
      }
    }
    
    // Check 4: Contiguous transactions (rapid succession)
    if (senderProfile.last30Transactions && senderProfile.last30Transactions.length > 0) {
      const lastTxn = senderProfile.last30Transactions[senderProfile.last30Transactions.length - 1]
      const timeDiff = new Date(txnData.transaction_timestamp) - new Date(lastTxn.timestamp)
      const minutesDiff = timeDiff / (1000 * 60)
      
      if (minutesDiff < 1 && senderProfile.last30Transactions.filter(t => {
        const diff = new Date(txnData.transaction_timestamp) - new Date(t.timestamp)
        return diff < 60000 // Within 1 minute
      }).length >= 3) {
        violations.push('Multiple rapid transactions detected')
        riskScore += 0.4
        fraudReasons.high_velocity = true
      }
    }
    
    if (violations.length > 0) {
      return {
        profile: senderProfile,
        fraud: {
          is_fraud: true,
          risk_score: Math.min(riskScore, 1.0),
          fraud_reason_unusual_amount: fraudReasons.unusual_amount,
          fraud_reason_geo_distance_anomaly: fraudReasons.geo_anomaly,
          fraud_reason_high_velocity: fraudReasons.high_velocity,
          fraud_severity: riskScore >= 0.7 ? 'HIGH' : 'MEDIUM',
          flag_color: 'RED',
          reason_of_fraud: violations.join('; ')
        }
      }
    }
    
    return { profile: senderProfile, fraud: null }
  }
  
  // STEP 4: Call gRPC ML Model
  async callMLModel(txnData) {
    try {
      const response = await fraudClient.detectFraud(txnData)
      return {
        is_fraud: response.is_fraud,
        risk_score: response.risk_score,
        fraud_reason_unusual_amount: response.fraud_reason_unusual_amount,
        fraud_reason_geo_distance_anomaly: response.fraud_reason_geo_distance_anomaly,
        fraud_reason_high_velocity: response.fraud_reason_high_velocity,
        fraud_severity: response.fraud_severity,
        flag_color: response.flag_color,
        reason_of_fraud: response.reason_of_fraud
      }
    } catch (error) {
      console.error('gRPC call failed:', error.message)
      // Fallback: No fraud detected
      return {
        is_fraud: false,
        risk_score: 0.0,
        fraud_reason_unusual_amount: false,
        fraud_reason_geo_distance_anomaly: false,
        fraud_reason_high_velocity: false,
        fraud_severity: 'LOW',
        flag_color: 'GREEN',
        reason_of_fraud: 'ML model unavailable - transaction approved'
      }
    }
  }
  
  // Main detection flow
  async detectFraud(txnData) {
    // STEP 3.1: Check static rules
    const staticFraud = await this.checkStaticRules(txnData)
    if (staticFraud) {
      await this.logFraudTransaction(txnData, staticFraud)
      return staticFraud
    }
    
    // STEP 3.2: Check behavioral anomalies
    const { profile, fraud: behavioralFraud } = await this.checkBehavioralAnomalies(txnData)
    if (behavioralFraud) {
      await this.logFraudTransaction(txnData, behavioralFraud)
      return behavioralFraud
    }
    
    // STEP 4: Call ML model
    const mlFraud = await this.callMLModel(txnData)
    await this.logFraudTransaction(txnData, mlFraud)
    
    // Update user profile if not fraud
    if (!mlFraud.is_fraud && profile) {
      await clientProfileRepository.updateMonthlySpend(
        txnData.sender_customer_id,
        txnData.amount_value
      )
      
      await clientProfileRepository.updateLast30Transactions(
        txnData.sender_customer_id,
        {
          transaction_id: txnData.transaction_id,
          amount: txnData.amount_value,
          timestamp: txnData.transaction_timestamp
        }
      )
    }
    
    return mlFraud
  }
  
  // Log transaction to database
  async logFraudTransaction(txnData, fraudResult) {
    return await fraudTransactionRepository.create({
      transactionId: txnData.transaction_id,
      transactionType: txnData.transaction_type,
      transactionStatus: txnData.transaction_status,
      transactionTimestamp: new Date(txnData.transaction_timestamp),
      amountValue: txnData.amount_value,
      amountCurrency: txnData.amount_currency,
      senderCustomerId: txnData.sender_customer_id,
      senderAccountId: txnData.sender_account_id,
      senderAccountType: txnData.sender_account_type,
      senderKycStatus: txnData.sender_kyc_status,
      senderAccountAgeDays: txnData.sender_account_age_days,
      senderState: txnData.sender_state,
      senderCity: txnData.sender_city,
      senderTxnCount1min: txnData.sender_txn_count_1min,
      senderTxnCount10min: txnData.sender_txn_count_10min,
      senderAmount24hr: txnData.sender_amount_24hr,
      deviceType: txnData.device_type,
      deviceOs: txnData.device_os,
      appVersion: txnData.app_version,
      ipRisk: txnData.ip_risk,
      receiverType: txnData.receiver_type,
      receiverBank: txnData.receiver_bank,
      merchantCategory: txnData.merchant_category,
      merchantRiskLevel: txnData.merchant_risk_level,
      paymentMethod: txnData.payment_method,
      authorizationType: txnData.authorization_type,
      isFraud: fraudResult.is_fraud,
      riskScore: fraudResult.risk_score,
      fraudReasonUnusualAmount: fraudResult.fraud_reason_unusual_amount,
      fraudReasonGeoDistanceAnomaly: fraudResult.fraud_reason_geo_distance_anomaly,
      fraudReasonHighVelocity: fraudResult.fraud_reason_high_velocity,
      fraudSeverity: fraudResult.fraud_severity,
      flagColor: fraudResult.flag_color,
      reasonOfFraud: fraudResult.reason_of_fraud
    })
  }
}

export default new FraudDetectionService()
```

**File**: `backend/controllers/fraud.controller.js`

```javascript
import fraudDetectionService from '../services/fraud-detection.service.js'

export const detectFraud = async (req, res, next) => {
  try {
    const txnData = req.body
    
    // Detect fraud
    const result = await fraudDetectionService.detectFraud(txnData)
    
    // Broadcast via WebSocket
    const io = req.app.get('io')
    io.emit('real-time-stream', {
      transaction_id: txnData.transaction_id,
      timestamp: txnData.transaction_timestamp,
      amount_value: txnData.amount_value,
      sender_state: txnData.sender_state,
      sender_city: txnData.sender_city,
      is_fraud: result.is_fraud,
      risk_score: result.risk_score,
      fraud_severity: result.fraud_severity,
      flag_color: result.flag_color,
      reason_of_fraud: result.reason_of_fraud
    })
    
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
}
```

**File**: `backend/routes/fraud.routes.js`

```javascript
import express from 'express'
import { detectFraud } from '../controllers/fraud.controller.js'

const router = express.Router()

router.post('/detect', detectFraud)

export default router
```

**Update**: `backend/server.js`

```javascript
import fraudRoutes from './routes/fraud.routes.js'
app.use('/api/transactions', fraudRoutes)
```

---

### STEP 5: Python gRPC Server

**File**: `ml-model/requirements.txt`

```
grpcio==1.60.0
grpcio-tools==1.60.0
pandas==2.1.0
```

**File**: `ml-model/server.py`

```python
import grpc
from concurrent import futures
import fraud_detection_pb2
import fraud_detection_pb2_grpc

class FraudDetectionService(fraud_detection_pb2_grpc.FraudDetectionServiceServicer):
    def DetectFraud(self, request, context):
        # PLACEHOLDER: ML model prediction
        prediction = self.predict_fraud(request)
        
        return fraud_detection_pb2.FraudResponse(
            is_fraud=prediction['is_fraud'],
            risk_score=prediction['risk_score'],
            fraud_reason_unusual_amount=prediction['unusual_amount'],
            fraud_reason_geo_distance_anomaly=prediction['geo_anomaly'],
            fraud_reason_high_velocity=prediction['high_velocity'],
            fraud_severity=prediction['severity'],
            flag_color=prediction['flag_color'],
            reason_of_fraud=prediction['reason']
        )
    
    def predict_fraud(self, request):
        # PLACEHOLDER: Replace with actual ML model
        risk_score = 0.0
        reasons = []
        
        if request.amount_value > 50000:
            risk_score += 0.3
            reasons.append('High transaction amount')
        
        if request.sender_txn_count_1min >= 5:
            risk_score += 0.4
            reasons.append('High transaction velocity')
        
        if request.ip_risk == 'HIGH':
            risk_score += 0.3
            reasons.append('High IP risk')
            
        is_fraud = risk_score >= 0.65
        
        return {
            'is_fraud': is_fraud,
            'risk_score': min(risk_score, 1.0),
            'unusual_amount': request.amount_value > 50000,
            'geo_anomaly': False,
            'high_velocity': request.sender_txn_count_1min >= 5,
            'severity': 'HIGH' if risk_score >= 0.8 else ('MEDIUM' if risk_score >= 0.5 else 'LOW'),
            'flag_color': 'RED' if is_fraud else 'GREEN',
            'reason': '; '.join(reasons) if reasons else 'No fraud detected'
        }

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    fraud_detection_pb2_grpc.add_FraudDetectionServiceServicer_to_server(
        FraudDetectionService(), server
    )
    server.add_insecure_port('[::]:50051')
    server.start()
    print("✅ gRPC ML server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

**Generate Python gRPC code**:
```bash
cd ml-model
python -m grpc_tools.protoc -I../proto --python_out=. --grpc_python_out=. ../proto/fraud_detection.proto
```

---

## Testing

1. **Start Python gRPC server**:
```bash
cd ml-model
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

2. **Start Backend**:
```bash
cd backend
npm run dev
```

3. **Test endpoint**:
```bash
curl -X POST http://localhost:5000/api/transactions/detect \
  -H "Content-Type: application/json" \
  -d @test-transaction.json
```

4. **Listen to WebSocket** (real-time-stream event)
