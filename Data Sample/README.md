# Fraud Detection Testing

## 📊 Test Data

This folder contains:
- **test_transactions.csv** - 100 transaction records (85 normal, 15 fraud)
- **test_fraud_detection.py** - Python script to test transactions

## 🚀 Quick Start

### 1. Ensure Backend is Running

```bash
cd backend
npm run dev
```

Backend should be running on http://localhost:5000

### 2. Run the Test Script

```bash
cd "Data Sample"
venv\Scripts\activate
python test_fraud_detection.py
```

### 3. Follow the Prompts

- Press ENTER to start testing
- Press ENTER after each transaction to continue
- Press Ctrl+C to stop at any time

## 📋 What the Script Does

1. **Reads CSV** - Loads all 100 transactions from test_transactions.csv
2. **Tests Each Transaction** - Calls the fraud detection API one by one
3. **Shows Results** - Displays fraud detection results with colors:
   - 🟢 Green = Approved
   - 🔴 Red = Fraud Detected
4. **Summary Statistics** - Shows total fraud vs approved transactions

## 🎨 Output Format

For each transaction, you'll see:
```
Transaction 1/100:
  ID: TXN_1234567890_1
  Customer: CUST_IND_000001
  Amount: ₹7500
  Location: Mumbai, Maharashtra
  Type: PAYMENT

  ✅ APPROVED
  Flag: GREEN
  Risk Score: 0.00
```

Or for fraud:
```
  🚨 FRAUD DETECTED!
  Flag: RED
  Risk Score: 1.00
  Severity: HIGH
  Reason: Amount 150000 exceeds single transaction limit of 100000 INR
```

## 📊 Test Data Breakdown

### 85 Normal Transactions
- Amount: ₹500 - ₹15,500
- Transaction velocity: Normal (0-1 per minute)
- Location: Same as registered
- IP Risk: LOW
- Merchant Risk: LOW

### 15 Fraud Transactions
Distributed across 3 fraud types:

1. **High Amount Fraud** (~5 transactions)
   - Amount: ₹100,000 - ₹200,000
   - Exceeds single transaction limit

2. **High Velocity Fraud** (~5 transactions)
   - 4-6 transactions in 1 minute
   - 11-15 transactions in 10 minutes
   - Exceeds velocity limits

3. **Geographic Fraud** (~5 transactions)
   - Transaction from different city (>500km away)
   - IP Risk: HIGH
   - Location mismatch detected

## 🔧 Customization

### Modify Test Data

Edit `backend/generate-transactions-csv.js` and run:
```bash
cd backend
node generate-transactions-csv.js
```

### Change API URL

Edit `test_fraud_detection.py`:
```python
API_URL = "http://localhost:5000/api/transactions/detect"
```

### Adjust Delay Between Requests

Edit `test_fraud_detection.py`:
```python
time.sleep(0.1)  # Change this value (seconds)
```

## 📈 Expected Results

With default fraud rules:
- **~85% Approved** - Normal transactions pass
- **~15% Fraud** - Fraudulent transactions detected

Fraud detection breakdown:
- Static Rules (Layer 1): ~10-12 transactions
- Behavioral Analysis (Layer 2): ~2-3 transactions
- ML Model (Layer 3): ~0-2 transactions

## 🎯 Testing Scenarios

### Scenario 1: All Transactions
Run the full test suite (100 transactions)

### Scenario 2: First 10 Only
Modify the script or press Ctrl+C after 10 transactions

### Scenario 3: Fraud Only
Filter the CSV to only include fraud transactions

### Scenario 4: Specific Customer
Filter the CSV to test one customer's transactions

## 🐛 Troubleshooting

### Connection Error
```
❌ Connection Error: Backend server not running?
```
**Solution**: Start the backend server

### File Not Found
```
❌ Error: test_transactions.csv not found!
```
**Solution**: Run `node generate-transactions-csv.js` in backend folder

### Timeout Error
```
❌ Timeout: Request took too long
```
**Solution**: Check if ML server is running or increase timeout

## 📝 Notes

- Each transaction is tested independently
- Results are displayed in real-time
- Summary statistics shown at the end
- All transactions are logged to the database
- WebSocket broadcasts fraud alerts in real-time

## 🎉 Success Indicators

✅ Backend server running
✅ 20 client profiles created
✅ 100 transactions generated
✅ Python script executes without errors
✅ Fraud detection working correctly
✅ Summary statistics displayed

---

**Happy Testing!** 🚀
