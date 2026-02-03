# ✅ Flagged Score Implementation - Complete!

## 🎯 What Was Added

Added **flaggedScore** field to track cumulative fraud risk for each customer. The score increases when fraud is detected and helps identify high-risk customers.

---

## 📋 Changes Made

### 1. Database Schema ✅

**File**: `backend/prisma/schema.prisma`

```prisma
model ClientProfile {
  // ... other fields
  flaggedScore  Float  @default(0) @map("flagged_score")
  // ... other fields
}
```

**Changes**:
- Added `flaggedScore` field (Float, default: 0)
- Mapped to database column `flagged_score`
- Schema pushed to database successfully

---

### 2. Repository Method ✅

**File**: `backend/repositories/client-profile.repository.js`

```javascript
async updateFlaggedScore(customerId, scoreIncrement) {
  const profile = await this.findByCustomerId(customerId)
  if (!profile) return null

  const newScore = Math.min(profile.flaggedScore + scoreIncrement, 100) // Cap at 100

  return await prisma.clientProfile.update({
    where: { customerId },
    data: { flaggedScore: newScore }
  })
}
```

**Features**:
- Updates flagged score by increment
- Caps score at 100 (maximum)
- Returns updated profile

---

### 3. Fraud Detection Service ✅

**File**: `backend/services/fraud-detection.service.js`

#### Updated Main Detection Flow

```javascript
async detectFraud(txnData) {
  // Check static rules
  const staticFraud = await this.checkStaticRules(txnData)
  if (staticFraud) {
    await this.logFraudTransaction(txnData, staticFraud)
    await this.updateFlaggedScore(txnData.sender_customer_id, staticFraud.risk_score)
    return staticFraud
  }

  // Check behavioral anomalies
  const { profile, fraud: behavioralFraud } = await this.checkBehavioralAnomalies(txnData)
  if (behavioralFraud) {
    await this.logFraudTransaction(txnData, behavioralFraud)
    await this.updateFlaggedScore(txnData.sender_customer_id, behavioralFraud.risk_score)
    return behavioralFraud
  }

  // Call ML model
  const mlFraud = await this.callMLModel(txnData)
  await this.logFraudTransaction(txnData, mlFraud)

  if (mlFraud.is_fraud) {
    await this.updateFlaggedScore(txnData.sender_customer_id, mlFraud.risk_score)
  } else if (profile) {
    // Update profile for non-fraud transactions
    await clientProfileRepository.updateMonthlySpend(...)
    await clientProfileRepository.updateLast30Transactions(...)
  }

  return mlFraud
}
```

#### New Score Update Method

```javascript
async updateFlaggedScore(customerId, riskScore) {
  let scoreIncrement = 0
  
  if (riskScore >= 0.7) {
    scoreIncrement = 10  // HIGH severity
  } else if (riskScore >= 0.4) {
    scoreIncrement = 5   // MEDIUM severity
  } else {
    scoreIncrement = 2   // LOW severity
  }

  await clientProfileRepository.updateFlaggedScore(customerId, scoreIncrement)
}
```

---

## 📊 Score Increment Logic

| Risk Score | Fraud Severity | Score Increment |
|------------|----------------|-----------------|
| 0.7 - 1.0  | HIGH           | +10 points      |
| 0.4 - 0.7  | MEDIUM         | +5 points       |
| 0.0 - 0.4  | LOW            | +2 points       |

### Risk Levels

| Flagged Score | Risk Level | Monitoring |
|---------------|------------|------------|
| 0 - 20        | LOW        | Normal     |
| 21 - 50       | MEDIUM     | Enhanced   |
| 51 - 75       | HIGH       | Manual review |
| 76 - 100      | CRITICAL   | Suspension recommended |

---

## 🔄 How It Works

### Flow Diagram

```
Transaction → Fraud Detection
                    ↓
              Is Fraud?
              ↙       ↘
            YES       NO
             ↓         ↓
        Calculate   Update
        Increment   Profile
             ↓      (no score
        Update      change)
        Flagged
        Score
             ↓
        Cap at 100
```

### Example Scenarios

#### Scenario 1: High Amount Fraud
```
Customer: Rajesh Sharma
Initial Score: 0

Transaction: ₹175,000 (exceeds ₹100k limit)
↓
Fraud: HIGH severity (risk_score: 1.0)
↓
Increment: +10 points
↓
New Score: 10 (LOW risk level)
```

#### Scenario 2: Repeat Offender
```
Customer: Arjun Mehta
Initial Score: 45

Fraud 1: High amount (+10) → Score: 55 (HIGH)
Fraud 2: Geographic (+5) → Score: 60 (HIGH)
Fraud 3: Velocity (+10) → Score: 70 (HIGH)

Action: Manual review required
```

#### Scenario 3: Critical Risk
```
Customer: Priya Patel
Initial Score: 78

Fraud: HIGH severity (+10)
↓
New Score: 88 (CRITICAL)
↓
Action: Account suspension recommended
```

---

## 🗂️ Files Modified

1. ✅ `backend/prisma/schema.prisma` - Added flaggedScore field
2. ✅ `backend/repositories/client-profile.repository.js` - Added updateFlaggedScore method
3. ✅ `backend/services/fraud-detection.service.js` - Added score update logic

---

## 🗂️ Files Created

1. ✅ `FLAGGED_SCORE_SYSTEM.md` - Complete documentation
2. ✅ `FLAGGED_SCORE_IMPLEMENTATION.md` - This file
3. ✅ `test-flagged-score.json` - Test transaction (high amount fraud)

---

## 🧪 Testing

### Test High Amount Fraud

```powershell
# This will trigger HIGH severity fraud (+10 points)
$body = Get-Content test-flagged-score.json -Raw
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/detect" -Method Post -Body $body -ContentType "application/json"
```

**Expected Result**:
- Fraud detected: YES
- Risk score: 1.0
- Flagged score increment: +10
- New flagged score: 10 (if starting from 0)

### Check Flagged Score in Database

```bash
cd backend
npm run prisma:studio
```

Navigate to `client_profiles` table and check the `flagged_score` column for CUST_IND_000001.

---

## 📊 Database Structure

### Before
```sql
client_profiles
├── customer_id
├── user_name
├── monthly_limit
├── current_month_spend
└── last_30_transactions
```

### After
```sql
client_profiles
├── customer_id
├── user_name
├── monthly_limit
├── current_month_spend
├── flagged_score ✨ NEW!
└── last_30_transactions
```

---

## 🎨 Frontend Integration

### Display Flagged Score

```jsx
function CustomerCard({ customer }) {
  const getRiskLevel = (score) => {
    if (score >= 76) return { level: 'CRITICAL', color: 'red', icon: '🚨' }
    if (score >= 51) return { level: 'HIGH', color: 'orange', icon: '⚠️' }
    if (score >= 21) return { level: 'MEDIUM', color: 'yellow', icon: '⚡' }
    return { level: 'LOW', color: 'green', icon: '✅' }
  }

  const risk = getRiskLevel(customer.flaggedScore)

  return (
    <div className="customer-card">
      <h3>{customer.userName}</h3>
      <p>{customer.customerId}</p>
      
      <div className={`risk-badge ${risk.color}`}>
        <span className="icon">{risk.icon}</span>
        <span className="score">{customer.flaggedScore}</span>
        <span className="level">{risk.level}</span>
      </div>
    </div>
  )
}
```

---

## 📈 Use Cases

### 1. High-Risk Customer Dashboard
Show customers with flagged score > 50

### 2. Automated Alerts
Send alerts when score crosses thresholds (21, 51, 76)

### 3. Manual Review Queue
List customers requiring manual review (score > 50)

### 4. Compliance Reporting
Track customers with critical risk (score > 75)

### 5. Trend Analysis
Monitor flagged score changes over time

---

## 🔔 Suggested Enhancements

### 1. Score Decay (Good Behavior Reward)
```javascript
// Reduce score by 5 points monthly for customers with no fraud
async function decayFlaggedScores() {
  // Reduce scores for customers with no fraud in last 30 days
}
```

### 2. Automated Alerts
```javascript
// Send alerts when score crosses thresholds
if (newScore >= 76) {
  sendAlert('CRITICAL', customerId)
} else if (newScore >= 51) {
  sendAlert('HIGH', customerId)
}
```

### 3. Account Actions
```javascript
// Automatically suspend accounts with critical scores
if (newScore >= 90) {
  await suspendAccount(customerId)
}
```

### 4. API Endpoints
```javascript
// GET /api/customers/:id/flagged-score
// GET /api/customers/high-risk
// POST /api/customers/:id/reset-score (admin only)
```

---

## ✅ Verification Checklist

- ✅ Database schema updated with flaggedScore
- ✅ Repository method created (updateFlaggedScore)
- ✅ Service logic implemented (score increments)
- ✅ Score capped at 100
- ✅ Fraud detection flow updated
- ✅ Documentation complete
- ✅ Test file created

---

## 🚀 Quick Start

### 1. Database is Ready
Schema already pushed, no migration needed.

### 2. Test the System

```bash
# Start backend
cd backend
npm run dev

# In another terminal, test fraud transaction
$body = Get-Content test-flagged-score.json -Raw
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/detect" -Method Post -Body $body -ContentType "application/json"

# Check database
npm run prisma:studio
```

### 3. Verify Score Updated

Check `client_profiles` table:
- Customer: CUST_IND_000001 (Rajesh Sharma)
- Flagged Score: Should be 10 (if was 0 before)

---

## 📚 Documentation

- **FLAGGED_SCORE_SYSTEM.md** - Complete system documentation
- **FLAGGED_SCORE_IMPLEMENTATION.md** - This file (implementation details)
- **backend/services/fraud-detection.service.js** - Source code

---

## 🎯 Summary

**Flagged Score System is now live!**

✅ **Database**: flaggedScore field added
✅ **Repository**: updateFlaggedScore method created
✅ **Service**: Score increment logic implemented
✅ **Logic**: HIGH (+10), MEDIUM (+5), LOW (+2)
✅ **Cap**: Maximum score is 100
✅ **Integration**: Works with all fraud detection layers
✅ **Documentation**: Complete guides created

**The system now tracks cumulative fraud risk for each customer!** 🚀

---

## 🔍 Next Steps

1. Test with multiple fraud transactions
2. Verify score increments correctly
3. Add frontend display for flagged scores
4. Implement automated alerts (optional)
5. Add score decay for good behavior (optional)
6. Create admin dashboard for high-risk customers

**Your fraud detection system now has customer risk scoring!** 🎉
