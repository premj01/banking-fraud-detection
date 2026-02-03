# 🎨 Frontend Integration Guide - User Names

## 📋 Overview

The backend now sends `sender_user_name` in all API responses and WebSocket events. This guide shows how to display user names in your React frontend.

---

## 🔌 WebSocket Integration

### Update Dashboard to Display User Names

**File**: `frontend/src/pages/Dashboard.jsx`

```jsx
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Connect to WebSocket
    const socket = io('http://localhost:5000')

    // Listen for real-time transactions
    socket.on('real-time-stream', (transaction) => {
      setTransactions(prev => [transaction, ...prev].slice(0, 50)) // Keep last 50
    })

    return () => socket.disconnect()
  }, [])

  return (
    <div className="dashboard">
      <h1>Real-Time Fraud Detection</h1>
      
      <div className="transaction-stream">
        {transactions.map(txn => (
          <TransactionCard key={txn.transaction_id} transaction={txn} />
        ))}
      </div>
    </div>
  )
}

function TransactionCard({ transaction }) {
  const isFraud = transaction.is_fraud
  const cardClass = isFraud ? 'card fraud' : 'card approved'

  return (
    <div className={cardClass}>
      {/* USER NAME - NEW! */}
      <div className="user-info">
        <h3 className="user-name">{transaction.sender_user_name}</h3>
        <p className="customer-id">{transaction.transaction_id}</p>
      </div>

      <div className="transaction-details">
        <div className="amount">
          <span className="label">Amount:</span>
          <span className="value">₹{transaction.amount_value.toLocaleString()}</span>
        </div>
        
        <div className="location">
          <span className="label">Location:</span>
          <span className="value">
            {transaction.sender_city}, {transaction.sender_state}
          </span>
        </div>

        <div className="risk">
          <span className="label">Risk Score:</span>
          <span className="value">{transaction.risk_score.toFixed(2)}</span>
        </div>
      </div>

      <div className={`status ${transaction.flag_color.toLowerCase()}`}>
        {isFraud ? (
          <>
            <span className="icon">🚨</span>
            <span className="text">FRAUD DETECTED</span>
            <p className="reason">{transaction.reason_of_fraud}</p>
          </>
        ) : (
          <>
            <span className="icon">✅</span>
            <span className="text">APPROVED</span>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 🎨 Styling

**File**: `frontend/src/index.css` (add these styles)

```css
/* Transaction Card */
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card.fraud {
  border-left: 4px solid #ef4444;
}

.card.approved {
  border-left: 4px solid #10b981;
}

/* User Info - NEW! */
.user-info {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.customer-id {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Transaction Details */
.transaction-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.transaction-details > div {
  display: flex;
  flex-direction: column;
}

.transaction-details .label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.transaction-details .value {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
}

/* Status */
.status {
  padding: 12px;
  border-radius: 6px;
  text-align: center;
}

.status.red {
  background: #fee2e2;
  color: #991b1b;
}

.status.green {
  background: #d1fae5;
  color: #065f46;
}

.status .icon {
  font-size: 1.5rem;
  margin-right: 8px;
}

.status .text {
  font-weight: 600;
  font-size: 1rem;
}

.status .reason {
  margin-top: 8px;
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Dark mode support */
.dark .card {
  background: #1f2937;
}

.dark .user-name {
  color: #f9fafb;
}

.dark .customer-id {
  color: #9ca3af;
}

.dark .transaction-details .value {
  color: #f9fafb;
}
```

---

## 📊 Transaction History Table

**Component**: Transaction History with User Names

```jsx
function TransactionHistory() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions/history')
      const data = await response.json()
      setTransactions(data.transactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Customer ID</th>
            <th>Amount</th>
            <th>Location</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(txn => (
            <tr key={txn.transaction_id} className={txn.is_fraud ? 'fraud-row' : ''}>
              {/* USER NAME - NEW! */}
              <td className="user-name-cell">
                <div className="user-avatar">
                  {txn.sender_user_name.charAt(0)}
                </div>
                <span>{txn.sender_user_name}</span>
              </td>
              
              <td className="customer-id-cell">
                {txn.sender_customer_id}
              </td>
              
              <td className="amount-cell">
                ₹{txn.amount_value.toLocaleString()}
              </td>
              
              <td className="location-cell">
                {txn.sender_city}, {txn.sender_state}
              </td>
              
              <td className="date-cell">
                {new Date(txn.transaction_timestamp).toLocaleString()}
              </td>
              
              <td className="status-cell">
                <span className={`badge ${txn.flag_color.toLowerCase()}`}>
                  {txn.is_fraud ? '🚨 Fraud' : '✅ Approved'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Styling**:
```css
.transaction-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.transaction-table th {
  background: #f3f4f6;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.transaction-table td {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}

.fraud-row {
  background: #fef2f2;
}

/* User Name Cell - NEW! */
.user-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.customer-id-cell {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.red {
  background: #fee2e2;
  color: #991b1b;
}

.badge.green {
  background: #d1fae5;
  color: #065f46;
}
```

---

## 🔔 Fraud Alert Component

**Component**: Real-time fraud alerts with user names

```jsx
function FraudAlerts() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const socket = io('http://localhost:5000')

    socket.on('real-time-stream', (transaction) => {
      if (transaction.is_fraud) {
        setAlerts(prev => [transaction, ...prev].slice(0, 10))
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('🚨 Fraud Detected!', {
            body: `${transaction.sender_user_name} - ₹${transaction.amount_value.toLocaleString()}`,
            icon: '/fraud-icon.png'
          })
        }
      }
    })

    return () => socket.disconnect()
  }, [])

  return (
    <div className="fraud-alerts">
      <h2>🚨 Recent Fraud Alerts</h2>
      
      {alerts.length === 0 ? (
        <p className="no-alerts">No fraud detected recently</p>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.transaction_id} className="alert-card">
              <div className="alert-header">
                <span className="alert-icon">🚨</span>
                <div className="alert-user">
                  {/* USER NAME - NEW! */}
                  <h4>{alert.sender_user_name}</h4>
                  <p>{alert.sender_customer_id}</p>
                </div>
                <span className="alert-severity">{alert.fraud_severity}</span>
              </div>
              
              <div className="alert-details">
                <div className="detail">
                  <span className="label">Amount:</span>
                  <span className="value">₹{alert.amount_value.toLocaleString()}</span>
                </div>
                <div className="detail">
                  <span className="label">Location:</span>
                  <span className="value">{alert.sender_city}</span>
                </div>
                <div className="detail">
                  <span className="label">Risk Score:</span>
                  <span className="value">{alert.risk_score.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="alert-reason">
                <strong>Reason:</strong> {alert.reason_of_fraud}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 📈 Statistics Dashboard

**Component**: Show fraud statistics by user

```jsx
function FraudStatistics() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    fraudCount: 0,
    topFraudUsers: []
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const response = await fetch('http://localhost:5000/api/transactions/stats')
    const data = await response.json()
    setStats(data)
  }

  return (
    <div className="fraud-statistics">
      <h2>Fraud Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalTransactions}</h3>
          <p>Total Transactions</p>
        </div>
        
        <div className="stat-card fraud">
          <h3>{stats.fraudCount}</h3>
          <p>Fraud Detected</p>
        </div>
        
        <div className="stat-card rate">
          <h3>{((stats.fraudCount / stats.totalTransactions) * 100).toFixed(1)}%</h3>
          <p>Fraud Rate</p>
        </div>
      </div>

      {/* Top Fraud Users - NEW! */}
      <div className="top-fraud-users">
        <h3>Users with Most Fraud Attempts</h3>
        <div className="users-list">
          {stats.topFraudUsers.map((user, index) => (
            <div key={user.customer_id} className="user-item">
              <span className="rank">#{index + 1}</span>
              <div className="user-info">
                <h4>{user.user_name}</h4>
                <p>{user.customer_id}</p>
              </div>
              <span className="fraud-count">{user.fraud_count} frauds</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 🔍 Search by User Name

**Component**: Search transactions by user name

```jsx
function TransactionSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    
    const response = await fetch(
      `http://localhost:5000/api/transactions/search?name=${searchTerm}`
    )
    const data = await response.json()
    setResults(data.transactions)
  }

  return (
    <div className="transaction-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by user name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          🔍 Search
        </button>
      </form>

      <div className="search-results">
        {results.map(txn => (
          <div key={txn.transaction_id} className="result-item">
            <h4>{txn.sender_user_name}</h4>
            <p>₹{txn.amount_value.toLocaleString()} - {txn.sender_city}</p>
            <span className={`badge ${txn.flag_color.toLowerCase()}`}>
              {txn.is_fraud ? 'Fraud' : 'Approved'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Complete Dashboard Example

**File**: `frontend/src/pages/Dashboard.jsx`

```jsx
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [fraudAlerts, setFraudAlerts] = useState([])

  useEffect(() => {
    const socket = io('http://localhost:5000')

    socket.on('real-time-stream', (transaction) => {
      // Add to transaction stream
      setTransactions(prev => [transaction, ...prev].slice(0, 50))
      
      // Add to fraud alerts if fraud
      if (transaction.is_fraud) {
        setFraudAlerts(prev => [transaction, ...prev].slice(0, 10))
      }
    })

    return () => socket.disconnect()
  }, [])

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Fraud Detection Dashboard</h1>
        <div className="stats-summary">
          <div className="stat">
            <span className="value">{transactions.length}</span>
            <span className="label">Total Transactions</span>
          </div>
          <div className="stat fraud">
            <span className="value">{fraudAlerts.length}</span>
            <span className="label">Fraud Detected</span>
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Real-time stream */}
        <section className="transaction-stream">
          <h2>Real-Time Transactions</h2>
          {transactions.map(txn => (
            <div key={txn.transaction_id} className={`card ${txn.is_fraud ? 'fraud' : 'approved'}`}>
              <div className="user-info">
                <h3>{txn.sender_user_name}</h3>
                <p>{txn.transaction_id}</p>
              </div>
              <div className="details">
                <p>₹{txn.amount_value.toLocaleString()}</p>
                <p>{txn.sender_city}, {txn.sender_state}</p>
              </div>
              <div className={`status ${txn.flag_color.toLowerCase()}`}>
                {txn.is_fraud ? '🚨 FRAUD' : '✅ APPROVED'}
              </div>
            </div>
          ))}
        </section>

        {/* Fraud alerts */}
        <aside className="fraud-alerts-sidebar">
          <h2>🚨 Fraud Alerts</h2>
          {fraudAlerts.map(alert => (
            <div key={alert.transaction_id} className="alert-card">
              <h4>{alert.sender_user_name}</h4>
              <p>₹{alert.amount_value.toLocaleString()}</p>
              <p className="reason">{alert.reason_of_fraud}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
```

---

## ✅ Integration Checklist

- [ ] Install socket.io-client: `npm install socket.io-client`
- [ ] Update Dashboard component to display user names
- [ ] Add styling for user name display
- [ ] Create TransactionCard component
- [ ] Add FraudAlerts component
- [ ] Implement TransactionHistory table
- [ ] Add search by user name
- [ ] Test WebSocket connection
- [ ] Test real-time updates
- [ ] Verify user names display correctly

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd frontend
npm install socket.io-client

# 2. Update Dashboard.jsx with user name display

# 3. Start frontend
npm run dev

# 4. Open browser and test
# http://localhost:3000
```

---

## 🎯 Summary

The backend now sends `sender_user_name` in:
- ✅ API responses
- ✅ WebSocket events
- ✅ All transaction data

Frontend can display user names in:
- ✅ Real-time transaction stream
- ✅ Transaction history table
- ✅ Fraud alerts
- ✅ Search results
- ✅ Statistics dashboard

**Your frontend is ready to display customer names!** 🚀
