# 🚩 Flagged Score System

## 📋 Overview

The **Flagged Score** is a cumulative risk indicator that tracks each customer's fraud history. It increases when fraud is detected and helps identify high-risk customers over time.

---

## 🎯 Purpose

- **Track fraud patterns** per customer
- **Identify repeat offenders** with high flagged scores
- **Risk-based monitoring** for future transactions
- **Automated alerts** for high-risk customers
- **Compliance reporting** for suspicious accounts

---

## 📊 How It Works

### Score Range
- **Minimum**: 0 (clean record)
- **Maximum**: 100 (capped)
- **Default**: 0 (new customers)

### Score Increments

When fraud is detected, the flagged score increases based on risk severity:

| Risk Score | Fraud Severity | Score Increment |
|------------|----------------|-----------------|
| 0.7 - 1.0  | HIGH           | +10 points      |
| 0.4 - 0.7  | MEDIUM         | +5 points       |
| 0.0 - 0.4  | LOW            | +2 points       |

### Risk Levels

| Flagged Score | Risk Level | Action Required |
|---------------|------------|-----------------|
| 0 - 20        | LOW        | Normal monitoring |
| 21 - 50       | MEDIUM     | Enhanced monitoring |
| 51 - 75       | HIGH       | Manual review required |
| 76 - 100      | CRITICAL   | Account suspension recommended |

---

## 🔄 Score Update Flow

```
Transaction Received
        ↓
Fraud Detection
        ↓
    Is Fraud?
    ↙     ↘
  YES      NO
   ↓        ↓
Calculate  Update
Increment  Profile
   ↓        ↓
Update     (no score
Flagged    change)
Score
   ↓
Cap at 100
```

---

## 💻 Implementation

### Database Schema

```prisma
model ClientProfile {
  // ... other fields
  flaggedScore  Float  @default(0) @map("flagged_score")
  // ... other fields
}
```

### Repository Method

```javascript
async updateFlaggedScore(customerId, scoreIncrement) {
  const profile = await this.findByCustomerId(customerId)
  if (!profile) return null

  const newScore = Math.min(profile.flaggedScore + scoreIncrement, 100)

  return await prisma.clientProfile.update({
    where: { customerId },
    data: { flaggedScore: newScore }
  })
}
```

### Service Logic

```javascript
async updateFlaggedScore(customerId, riskScore) {
  let scoreIncrement = 0
  
  if (riskScore >= 0.7) {
    scoreIncrement = 10  // HIGH
  } else if (riskScore >= 0.4) {
    scoreIncrement = 5   // MEDIUM
  } else {
    scoreIncrement = 2   // LOW
  }

  await clientProfileRepository.updateFlaggedScore(customerId, scoreIncrement)
}
```

---

## 📈 Example Scenarios

### Scenario 1: First-Time Fraud (High Amount)

```
Customer: Rajesh Sharma (CUST_IND_000001)
Initial Flagged Score: 0

Transaction: ₹175,000 (exceeds limit)
↓
Fraud Detected: HIGH severity
Risk Score: 1.0
↓
Score Increment: +10
↓
New Flagged Score: 10
Risk Level: LOW (normal monitoring)
```

### Scenario 2: Repeat Offender

```
Customer: Arjun Mehta (CUST_IND_000009)
Initial Flagged Score: 45

Transaction 1: ₹150,000 (high amount)
↓ Fraud: HIGH (+10)
↓ Score: 55 (HIGH risk level)

Transaction 2: Geographic fraud (845km)
↓ Fraud: MEDIUM (+5)
↓ Score: 60 (HIGH risk level)

Transaction 3: High velocity (6 txn/min)
↓ Fraud: HIGH (+10)
↓ Score: 70 (HIGH risk level)

Action: Manual review required
```

### Scenario 3: Critical Risk Customer

```
Customer: Priya Patel (CUST_IND_000002)
Initial Flagged Score: 78

Transaction: ₹200,000 + velocity fraud
↓
Fraud Detected: HIGH severity
Risk Score: 1.0
↓
Score Increment: +10
↓
New Flagged Score: 88 (capped at 100)
Risk Level: CRITICAL

Action: Account suspension recommended
Alert: Compliance team notified
```

---

## 🔍 Querying Flagged Scores

### Get High-Risk Customers

```javascript
// Get customers with flagged score > 50
const highRiskCustomers = await prisma.clientProfile.findMany({
  where: {
    flaggedScore: { gt: 50 }
  },
  orderBy: {
    flaggedScore: 'desc'
  }
})
```

### Get Customer Risk Level

```javascript
function getRiskLevel(flaggedScore) {
  if (flaggedScore >= 76) return 'CRITICAL'
  if (flaggedScore >= 51) return 'HIGH'
  if (flaggedScore >= 21) return 'MEDIUM'
  return 'LOW'
}
```

---

## 📊 Dashboard Integration

### Display Flagged Score in Frontend

```jsx
function CustomerRiskBadge({ flaggedScore }) {
  const getRiskLevel = (score) => {
    if (score >= 76) return { level: 'CRITICAL', color: 'red', icon: '🚨' }
    if (score >= 51) return { level: 'HIGH', color: 'orange', icon: '⚠️' }
    if (score >= 21) return { level: 'MEDIUM', color: 'yellow', icon: '⚡' }
    return { level: 'LOW', color: 'green', icon: '✅' }
  }

  const risk = getRiskLevel(flaggedScore)

  return (
    <div className={`risk-badge ${risk.color}`}>
      <span className="icon">{risk.icon}</span>
      <span className="score">{flaggedScore}</span>
      <span className="level">{risk.level}</span>
    </div>
  )
}
```

### Customer Profile Card

```jsx
function CustomerProfile({ customer }) {
  return (
    <div className="customer-card">
      <h3>{customer.userName}</h3>
      <p>{customer.customerId}</p>
      
      <div className="risk-info">
        <label>Flagged Score:</label>
        <CustomerRiskBadge flaggedScore={customer.flaggedScore} />
      </div>
      
      <div className="stats">
        <div>
          <label>Monthly Spend:</label>
          <span>₹{customer.currentMonthSpend.toLocaleString()}</span>
        </div>
        <div>
          <label>Monthly Limit:</label>
          <span>₹{customer.monthlyLimit.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔔 Automated Alerts

### High-Risk Alert System

```javascript
async function checkAndAlertHighRisk(customerId, newFlaggedScore) {
  const thresholds = {
    MEDIUM: 21,
    HIGH: 51,
    CRITICAL: 76
  }

  if (newFlaggedScore >= thresholds.CRITICAL) {
    await sendAlert({
      level: 'CRITICAL',
      customerId,
      flaggedScore: newFlaggedScore,
      message: 'Account suspension recommended',
      recipients: ['compliance@bank.com', 'security@bank.com']
    })
  } else if (newFlaggedScore >= thresholds.HIGH) {
    await sendAlert({
      level: 'HIGH',
      customerId,
      flaggedScore: newFlaggedScore,
      message: 'Manual review required',
      recipients: ['fraud-team@bank.com']
    })
  } else if (newFlaggedScore >= thresholds.MEDIUM) {
    await sendAlert({
      level: 'MEDIUM',
      customerId,
      flaggedScore: newFlaggedScore,
      message: 'Enhanced monitoring enabled',
      recipients: ['monitoring@bank.com']
    })
  }
}
```

---

## 📉 Score Decay (Optional Enhancement)

### Reduce Score Over Time for Good Behavior

```javascript
// Run monthly to reduce scores for customers with no recent fraud
async function decayFlaggedScores() {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  // Get customers with no fraud in last 30 days
  const customers = await prisma.clientProfile.findMany({
    where: {
      flaggedScore: { gt: 0 },
      updatedAt: { lt: oneMonthAgo }
    }
  })

  for (const customer of customers) {
    // Check if they have any fraud in last 30 days
    const recentFraud = await prisma.fraudTransaction.findFirst({
      where: {
        senderCustomerId: customer.customerId,
        isFraud: true,
        createdAt: { gte: oneMonthAgo }
      }
    })

    if (!recentFraud) {
      // Reduce score by 5 points for good behavior
      const newScore = Math.max(customer.flaggedScore - 5, 0)
      
      await prisma.clientProfile.update({
        where: { id: customer.id },
        data: { flaggedScore: newScore }
      })
    }
  }
}
```

---

## 📊 Reporting & Analytics

### Flagged Score Distribution

```javascript
async function getFlaggedScoreDistribution() {
  const distribution = await prisma.clientProfile.groupBy({
    by: ['flaggedScore'],
    _count: true
  })

  return {
    low: distribution.filter(d => d.flaggedScore <= 20).length,
    medium: distribution.filter(d => d.flaggedScore > 20 && d.flaggedScore <= 50).length,
    high: distribution.filter(d => d.flaggedScore > 50 && d.flaggedScore <= 75).length,
    critical: distribution.filter(d => d.flaggedScore > 75).length
  }
}
```

### Top Flagged Customers

```javascript
async function getTopFlaggedCustomers(limit = 10) {
  return await prisma.clientProfile.findMany({
    where: {
      flaggedScore: { gt: 0 }
    },
    orderBy: {
      flaggedScore: 'desc'
    },
    take: limit,
    select: {
      customerId: true,
      userName: true,
      flaggedScore: true,
      city: true,
      state: true,
      currentMonthSpend: true,
      monthlyLimit: true
    }
  })
}
```

---

## 🎯 Benefits

1. **Early Detection**: Identify repeat offenders quickly
2. **Risk Prioritization**: Focus on high-risk customers
3. **Automated Actions**: Trigger alerts and reviews automatically
4. **Compliance**: Track suspicious activity for regulatory reporting
5. **Trend Analysis**: Monitor fraud patterns over time
6. **Resource Optimization**: Allocate fraud prevention resources efficiently

---

## 🔧 Configuration

### Customize Score Increments

Edit `backend/services/fraud-detection.service.js`:

```javascript
async updateFlaggedScore(customerId, riskScore) {
  let scoreIncrement = 0
  
  if (riskScore >= 0.7) {
    scoreIncrement = 15  // Increase for stricter policy
  } else if (riskScore >= 0.4) {
    scoreIncrement = 8
  } else {
    scoreIncrement = 3
  }

  await clientProfileRepository.updateFlaggedScore(customerId, scoreIncrement)
}
```

### Customize Risk Thresholds

```javascript
const RISK_THRESHOLDS = {
  LOW: { min: 0, max: 20 },
  MEDIUM: { min: 21, max: 50 },
  HIGH: { min: 51, max: 75 },
  CRITICAL: { min: 76, max: 100 }
}
```

---

## 📝 API Endpoints (Suggested)

### Get Customer Flagged Score

```javascript
// GET /api/customers/:customerId/flagged-score
router.get('/customers/:customerId/flagged-score', async (req, res) => {
  const profile = await clientProfileRepository.findByCustomerId(
    req.params.customerId
  )
  
  res.json({
    customerId: profile.customerId,
    userName: profile.userName,
    flaggedScore: profile.flaggedScore,
    riskLevel: getRiskLevel(profile.flaggedScore)
  })
})
```

### Get High-Risk Customers

```javascript
// GET /api/customers/high-risk
router.get('/customers/high-risk', async (req, res) => {
  const customers = await prisma.clientProfile.findMany({
    where: { flaggedScore: { gte: 51 } },
    orderBy: { flaggedScore: 'desc' }
  })
  
  res.json({ customers })
})
```

---

## ✅ Summary

**Flagged Score System Features:**

- ✅ Tracks cumulative fraud risk per customer
- ✅ Increments based on fraud severity (HIGH: +10, MEDIUM: +5, LOW: +2)
- ✅ Capped at 100 to prevent overflow
- ✅ Four risk levels: LOW, MEDIUM, HIGH, CRITICAL
- ✅ Integrated with fraud detection service
- ✅ Stored in database (client_profiles table)
- ✅ Ready for frontend display
- ✅ Supports automated alerts
- ✅ Enables compliance reporting

**The flagged score system helps identify and monitor high-risk customers effectively!** 🚀
