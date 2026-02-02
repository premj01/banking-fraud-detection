# Implementation Prompt for AI Code Editor

## Task: Build Real-Time Fraud Detection System

### Context
We have an existing Express.js + Prisma + PostgreSQL backend. We need to add a fraud detection system that processes transactions through a Python ML service via gRPC.

---

## Step-by-Step Implementation

### STEP 1: Update Database Schema

**File**: `backend/prisma/schema.prisma`

Add two new models:

```prisma
model UserProfile {
  id                    String   @id @default(cuid())
  customerId            String   @unique @map("customer_id")
  accountId             String   @unique @map("account_id")
  accountType           Int      @map("account_type")
  accountAgeDays        Int      @map("account_age_days")
  accountCreatedAt      DateTime @map("account_created_at")
  kycStatus             Int      @map("kyc_status")
  
  homeState             String?  @map("home_state")
  homeCity              String?  @map("home_city")
  homeLatitude          Float?   @map("home_latitude")
  homeLongitude         Float?   @map("home_longitude")
  currentLatitude       Float?   @map("current_latitude")
  currentLongitude      Float?   @map("current_longitude")
  
  monthlyLimit          Float    @default(100000) @map("monthly_limit")
  currentMonthSpend     Float    @default(0) @map("current_month_spend")
  
  last30Transactions    Json     @default("[]") @map("last_30_transactions")
  
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("user_profiles")
}

model Transaction {
  id                              String   @id @default(cuid())
  transactionId                   String   @unique @map("transaction_id")
  transactionType                 Int      @map("transaction_type")
  transactionStatus               Int      @map("transaction_status")
  transactionTimestamp            DateTime @map("transaction_timestamp")
  
  amountValue                     Float    @map("amount_value")
  amountCurrency                  String   @default("INR") @map("amount_currency")
  
  senderCustomerId                String   @map("sender_customer_id")
  senderAccountId                 String   @map("sender_account_id")
  senderAccountType               Int?     @map("sender_account_type")
  senderKycStatus                 Int?     @map("sender_kyc_status")
  senderAccountAgeDays            Int?     @map("sender_account_age_days")
  senderState                     String?  @map("sender_state")
  senderCity                      String?  @map("sender_city")
  senderTxnCount1min              Int?     @map("sender_txn_count_1min")
  senderTxnCount10min             Int?     @map("sender_txn_count_10min")
  senderAmount24hr                Float?   @map("sender_amount_24hr")
  
  deviceType                      Int?     @map("device_type")
  deviceOs                        Int?     @map("device_os")
  appVersion                      String?  @map("app_version")
  ipRisk                          Int?     @map("ip_risk")
  
  receiverType                    Int?     @map("receiver_type")
  receiverBank                    String?  @map("receiver_bank")
  merchantCategory                Int?     @map("merchant_category")
  merchantRiskLevel               Int?     @map("merchant_risk_level")
  
  paymentMethod                   Int?     @map("payment_method")
  authorizationType               Int?     @map("authorization_type")
  
  isFraud                         Int      @map("is_fraud")
  riskScore                       Float?   @map("risk_score")
  fraudReasonUnusualAmount        Int      @default(0) @map("fraud_reason_unusual_amount")
  fraudReasonGeoDistanceAnomaly   Int      @default(0) @map("fraud_reason_geo_distance_anomaly")
  fraudReasonHighVelocity         Int      @default(0) @map("fraud_reason_high_velocity")
  fraudSeverity                   Int?     @map("fraud_severity")
  flagColor                       Int?     @map("flag_color")
  
  createdAt                       DateTime @default(now()) @map("created_at")

  @@index([senderCustomerId])
  @@index([transactionTimestamp])
  @@index([isFraud])
  @@map("transactions")
}
```

After adding, run:
```bash
cd backend
npm run prisma:push
npm run prisma:generate
```

---

### STEP 2: Create Proto File

**File**: `backend/proto/fraud_detection.proto`

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
  
  int32 device_type = 16;
  int32 device_os = 17;
  string app_version = 18;
  int32 ip_risk = 19;
  
  int32 receiver_type = 20;
  string receiver_bank = 21;
  int32 merchant_category = 22;
  int32 merchant_risk_level = 23;
  
  int32 payment_method = 24;
  int32 authorization_type = 25;
  
  double geo_distance_km = 26;
  int32 transaction_velocity = 27;
  double amount_deviation = 28;
}

message FraudResponse {
  int32 is_fraud = 1;
  double risk_score = 2;
  int32 fraud_reason_unusual_amount = 3;
  int32 fraud_reason_geo_distance_anomaly = 4;
  int32 fraud_reason_high_velocity = 5;
  int32 fraud_severity = 6;
  int32 flag_color = 7;
  string model_version = 8;
}
```

---

### STEP 3: Install gRPC Dependencies

**In backend folder**, add to `package.json`:
```json
{
  "dependencies": {
    "@grpc/grpc-js": "^1.9.0",
    "@grpc/proto-loader": "^0.7.10"
  }
}
```

Run: `npm install`

---

### STEP 4: Create gRPC Client

**File**: `backend/grpc/fraud-client.js`

```javascript
import grpc from '@grpc/grpc-js'
import protoLoader from '@grpc/proto-loader'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROTO_PATH = path.join(__dirname, '../proto/fraud_detection.proto')

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

---

### STEP 5: Create Utility Functions

**File**: `backend/utils/geo-calculator.js`

```javascript
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
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

**File**: `backend/utils/hard-limits.js`

```javascript
export const HARD_LIMITS = {
  MAX_TXN_PER_1MIN: 3,
  MAX_TXN_PER_10MIN: 10,
  MAX_AMOUNT_24HR: 200000,
  MAX_SINGLE_TXN: 100000,
  MAX_MONTHLY_LIMIT: 500000
}

export function checkHardLimits(txnData, userProfile) {
  const violations = []
  
  if (txnData.sender_txn_count_1min > HARD_LIMITS.MAX_TXN_PER_1MIN) {
    violations.push('MAX_TXN_PER_1MIN_EXCEEDED')
  }
  
  if (txnData.sender_txn_count_10min > HARD_LIMITS.MAX_TXN_PER_10MIN) {
    violations.push('MAX_TXN_PER_10MIN_EXCEEDED')
  }
  
  if (txnData.sender_amount_24hr > HARD_LIMITS.MAX_AMOUNT_24HR) {
    violations.push('MAX_AMOUNT_24HR_EXCEEDED')
  }
  
  if (txnData.amount_value > HARD_LIMITS.MAX_SINGLE_TXN) {
    violations.push('MAX_SINGLE_TXN_EXCEEDED')
  }
  
  if (userProfile && userProfile.currentMonthSpend + txnData.amount_value > userProfile.monthlyLimit) {
    violations.push('MONTHLY_LIMIT_EXCEEDED')
  }
  
  return {
    passed: violations.length === 0,
    violations
  }
}
```

---

### STEP 6: Create Repositories

**File**: `backend/repositories/user-profile.repository.js`

```javascript
import prisma from '../lib/prisma.js'

export class UserProfileRepository {
  async findByCustomerId(customerId) {
    return await prisma.userProfile.findUnique({
      where: { customerId }
    })
  }

  async updateMonthlySpend(customerId, amount) {
    return await prisma.userProfile.update({
      where: { customerId },
      data: {
        currentMonthSpend: {
          increment: amount
        }
      }
    })
  }

  async updateLast30Transactions(customerId, newTransaction) {
    const profile = await this.findByCustomerId(customerId)
    if (!profile) return null

    let transactions = profile.last30Transactions
    transactions.push(newTransaction)
    
    if (transactions.length > 30) {
      transactions = transactions.slice(-30)
    }

    return await prisma.userProfile.update({
      where: { customerId },
      data: { last30Transactions: transactions }
    })
  }
}

export default new UserProfileRepository()
```

**File**: `backend/repositories/transaction.repository.js`

```javascript
import prisma from '../lib/prisma.js'

export class TransactionRepository {
  async create(data) {
    return await prisma.transaction.create({ data })
  }

  async findRecentByCustomerId(customerId, minutes) {
    const since = new Date(Date.now() - minutes * 60 * 1000)
    return await prisma.transaction.findMany({
      where: {
        senderCustomerId: customerId,
        transactionTimestamp: { gte: since }
      }
    })
  }

  async getAmount24hr(customerId) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await prisma.transaction.aggregate({
      where: {
        senderCustomerId: customerId,
        transactionTimestamp: { gte: since }
      },
      _sum: { amountValue: true }
    })
    return result._sum.amountValue || 0
  }
}

export default new TransactionRepository()
```

---

### STEP 7: Create Fraud Detection Service

**File**: `backend/services/fraud-detection.service.js`

```javascript
import fraudClient from '../grpc/fraud-client.js'
import userProfileRepository from '../repositories/user-profile.repository.js'
import transactionRepository from '../repositories/transaction.repository.js'
import { calculateDistance } from '../utils/geo-calculator.js'
import { checkHardLimits } from '../utils/hard-limits.js'

export class FraudDetectionService {
  async processTransaction(txnData) {
    // Step 1: Fetch user profile
    const userProfile = await userProfileRepository.findByCustomerId(
      txnData.sender_customer_id
    )

    // Step 2: Calculate metrics
    const metrics = await this.calculateMetrics(txnData, userProfile)

    // Step 3: Check hard limits
    const hardLimitCheck = checkHardLimits(
      { ...txnData, ...metrics },
      userProfile
    )

    if (!hardLimitCheck.passed) {
      return {
        is_fraud: 1,
        risk_score: 1.0,
        fraud_severity: 2,
        flag_color: 1,
        fraud_reason_high_velocity: 1,
        fraud_reason_unusual_amount: 0,
        fraud_reason_geo_distance_anomaly: 0,
        hard_limit_violations: hardLimitCheck.violations
      }
    }

    // Step 4: Call gRPC ML service
    const mlRequest = {
      ...txnData,
      ...metrics
    }

    try {
      const mlResponse = await fraudClient.detectFraud(mlRequest)
      return mlResponse
    } catch (error) {
      console.error('gRPC call failed:', error)
      // Fallback to rule-based detection
      return this.fallbackDetection(txnData, metrics)
    }
  }

  async calculateMetrics(txnData, userProfile) {
    const metrics = {}

    // Transaction counts
    const txns1min = await transactionRepository.findRecentByCustomerId(
      txnData.sender_customer_id,
      1
    )
    const txns10min = await transactionRepository.findRecentByCustomerId(
      txnData.sender_customer_id,
      10
    )

    metrics.sender_txn_count_1min = txns1min.length
    metrics.sender_txn_count_10min = txns10min.length

    // 24hr amount
    metrics.sender_amount_24hr = await transactionRepository.getAmount24hr(
      txnData.sender_customer_id
    )

    // Geographic distance
    if (userProfile && userProfile.homeLatitude && userProfile.currentLatitude) {
      metrics.geo_distance_km = calculateDistance(
        userProfile.homeLatitude,
        userProfile.homeLongitude,
        userProfile.currentLatitude,
        userProfile.currentLongitude
      )
    } else {
      metrics.geo_distance_km = 0
    }

    // Transaction velocity
    metrics.transaction_velocity = txns1min.length

    // Amount deviation
    if (userProfile && userProfile.last30Transactions.length > 0) {
      const avgAmount = userProfile.last30Transactions.reduce(
        (sum, t) => sum + t.amount,
        0
      ) / userProfile.last30Transactions.length
      metrics.amount_deviation = Math.abs(txnData.amount_value - avgAmount) / avgAmount
    } else {
      metrics.amount_deviation = 0
    }

    return metrics
  }

  fallbackDetection(txnData, metrics) {
    let riskScore = 0

    if (txnData.amount_value > 50000) riskScore += 0.3
    if (metrics.sender_txn_count_1min >= 5) riskScore += 0.4
    if (metrics.geo_distance_km > 500) riskScore += 0.3

    return {
      is_fraud: riskScore >= 0.65 ? 1 : 0,
      risk_score: Math.min(riskScore, 1.0),
      fraud_reason_unusual_amount: txnData.amount_value > 50000 ? 1 : 0,
      fraud_reason_geo_distance_anomaly: metrics.geo_distance_km > 500 ? 1 : 0,
      fraud_reason_high_velocity: metrics.sender_txn_count_1min >= 5 ? 1 : 0,
      fraud_severity: riskScore >= 0.8 ? 2 : (riskScore >= 0.5 ? 1 : 0),
      flag_color: riskScore >= 0.65 ? 1 : 0
    }
  }
}

export default new FraudDetectionService()
```

---

### STEP 8: Create Transaction Service

**File**: `backend/services/transaction.service.js`

```javascript
import fraudDetectionService from './fraud-detection.service.js'
import transactionRepository from '../repositories/transaction.repository.js'
import userProfileRepository from '../repositories/user-profile.repository.js'

export class TransactionService {
  async processTransaction(txnData) {
    // Detect fraud
    const fraudResult = await fraudDetectionService.processTransaction(txnData)

    // Prepare transaction data
    const transactionData = {
      transactionId: txnData.transaction_id,
      transactionType: txnData.transaction_type,
      transactionStatus: 1,
      transactionTimestamp: new Date(txnData.transaction_timestamp),
      amountValue: txnData.amount_value,
      amountCurrency: txnData.amount_currency || 'INR',
      senderCustomerId: txnData.sender_customer_id,
      senderAccountId: txnData.sender_account_id,
      senderAccountType: txnData.sender_account_type,
      senderKycStatus: txnData.sender_kyc_status,
      senderAccountAgeDays: txnData.sender_account_age_days,
      senderState: txnData.sender_state,
      senderCity: txnData.sender_city,
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
      flagColor: fraudResult.flag_color
    }

    // Store transaction
    const transaction = await transactionRepository.create(transactionData)

    // Update user profile if not fraud
    if (fraudResult.is_fraud === 0) {
      await userProfileRepository.updateMonthlySpend(
        txnData.sender_customer_id,
        txnData.amount_value
      )

      await userProfileRepository.updateLast30Transactions(
        txnData.sender_customer_id,
        {
          transaction_id: txnData.transaction_id,
          amount: txnData.amount_value,
          timestamp: txnData.transaction_timestamp
        }
      )
    }

    return {
      transaction,
      fraudResult
    }
  }

  generateSampleData(count = 40) {
    // Implementation of data generator based on the prompt
    // Returns array of transaction objects
    const transactions = []
    
    for (let i = 0; i < count; i++) {
      const isFraud = Math.random() < 0.15 // 15% fraud
      
      transactions.push({
        transaction_id: `TXN${Date.now()}${i}`,
        transaction_type: Math.floor(Math.random() * 2),
        transaction_timestamp: new Date().toISOString(),
        amount_value: isFraud ? 50000 + Math.random() * 50000 : 50 + Math.random() * 15000,
        amount_currency: 'INR',
        sender_customer_id: `CUST${Math.floor(Math.random() * 1000)}`,
        sender_account_id: `ACC${Math.floor(Math.random() * 1000)}`,
        sender_account_type: Math.floor(Math.random() * 2),
        sender_kyc_status: Math.floor(Math.random() * 2),
        sender_account_age_days: Math.floor(Math.random() * 1000),
        sender_state: ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu'][Math.floor(Math.random() * 4)],
        sender_city: ['Mumbai', 'Bangalore', 'Delhi', 'Chennai'][Math.floor(Math.random() * 4)],
        device_type: Math.floor(Math.random() * 2),
        device_os: Math.floor(Math.random() * 3),
        app_version: '1.0.0',
        ip_risk: isFraud ? Math.floor(Math.random() * 2) + 1 : 0,
        receiver_type: Math.floor(Math.random() * 2),
        receiver_bank: 'HDFC',
        merchant_category: Math.floor(Math.random() * 8),
        merchant_risk_level: isFraud ? Math.floor(Math.random() * 2) + 1 : 0,
        payment_method: Math.floor(Math.random() * 3),
        authorization_type: Math.floor(Math.random() * 3)
      })
    }
    
    return transactions
  }
}

export default new TransactionService()
```

---

### STEP 9: Create Controllers

**File**: `backend/controllers/transaction.controller.js`

```javascript
import transactionService from '../services/transaction.service.js'

export const processTransaction = async (req, res, next) => {
  try {
    const result = await transactionService.processTransaction(req.body)
    
    // Broadcast via WebSocket if fraud or high risk
    if (result.fraudResult.is_fraud === 1 || result.fraudResult.risk_score > 0.5) {
      const io = req.app.get('io')
      io.emit('fraud-alert', {
        transaction_id: result.transaction.transactionId,
        timestamp: result.transaction.transactionTimestamp,
        amount_value: result.transaction.amountValue,
        sender_state: result.transaction.senderState,
        sender_city: result.transaction.senderCity,
        receiver_type: result.transaction.receiverType === 0 ? 'PERSON' : 'MERCHANT',
        risk_score: result.fraudResult.risk_score,
        fraud_severity: ['LOW', 'MEDIUM', 'HIGH'][result.fraudResult.fraud_severity],
        flag_color: result.fraudResult.flag_color === 0 ? 'GREEN' : 'RED'
      })
    }

    res.json({
      success: true,
      transaction_id: result.transaction.transactionId,
      is_fraud: result.fraudResult.is_fraud,
      risk_score: result.fraudResult.risk_score,
      flag_color: result.fraudResult.flag_color === 0 ? 'GREEN' : 'RED',
      message: result.fraudResult.is_fraud === 1 
        ? 'Transaction flagged as fraudulent' 
        : 'Transaction processed successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const generateSampleData = async (req, res, next) => {
  try {
    const count = parseInt(req.query.count) || 40
    const data = transactionService.generateSampleData(count)
    
    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    next(error)
  }
}
```

---

### STEP 10: Create Routes

**File**: `backend/routes/transaction.routes.js`

```javascript
import express from 'express'
import { processTransaction, generateSampleData } from '../controllers/transaction.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/process', authenticate, processTransaction)
router.get('/generate', generateSampleData)

export default router
```

---

### STEP 11: Register Routes in Server

**File**: `backend/server.js`

Add this line after existing routes:
```javascript
import transactionRoutes from './routes/transaction.routes.js'
app.use('/api/transactions', transactionRoutes)
```

---

### STEP 12: Create Python gRPC Server

**Create folder**: `python-ml-service/`

**File**: `python-ml-service/requirements.txt`
```
grpcio==1.60.0
grpcio-tools==1.60.0
```

**File**: `python-ml-service/server.py`
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
            model_version="v1.0.0-placeholder"
        )
    
    def predict_fraud(self, request):
        # PLACEHOLDER: Replace with actual ML model
        risk_score = 0.0
        
        if request.amount_value > 50000:
            risk_score += 0.3
        if request.sender_txn_count_1min >= 5:
            risk_score += 0.4
        if request.geo_distance_km > 500:
            risk_score += 0.3
            
        is_fraud = 1 if risk_score >= 0.65 else 0
        
        return {
            'is_fraud': is_fraud,
            'risk_score': min(risk_score, 1.0),
            'unusual_amount': 1 if request.amount_value > 50000 else 0,
            'geo_anomaly': 1 if request.geo_distance_km > 500 else 0,
            'high_velocity': 1 if request.sender_txn_count_1min >= 5 else 0,
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
    print("✅ gRPC server started on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
```

**Generate Python gRPC code**:
```bash
cd python-ml-service
python -m grpc_tools.protoc -I../backend/proto --python_out=. --grpc_python_out=. ../backend/proto/fraud_detection.proto
```

---

## Testing Steps

1. **Start Python gRPC server**:
   ```bash
   cd python-ml-service
   pip install -r requirements.txt
   python server.py
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Generate sample data**:
   ```bash
   curl http://localhost:5000/api/transactions/generate?count=40
   ```

4. **Process a transaction**:
   ```bash
   curl -X POST http://localhost:5000/api/transactions/process \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d @sample_transaction.json
   ```

5. **Listen to WebSocket**:
   Connect to `ws://localhost:5000` and listen for `fraud-alert` events

---

## Summary

This implementation:
✅ Creates database schema for user profiles and transactions
✅ Sets up gRPC communication between Node.js and Python
✅ Implements hard limit checks before ML processing
✅ Fetches user profile data for behavior analysis
✅ Calculates transaction metrics (velocity, geo-distance, etc.)
✅ Calls Python ML service for fraud prediction
✅ Stores transactions in PostgreSQL
✅ Updates user profiles with valid transactions
✅ Broadcasts fraud alerts via WebSocket (safe data only)
✅ Provides sample data generator endpoint
