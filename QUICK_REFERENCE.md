# 🚀 Fraud Detection System - Quick Reference

## Start Services

```bash
# 1. Start Python ML Server
cd ml-model
setup.bat          # First time only
start-server.bat

# 2. Backend (already running)
cd backend
npm run dev

# 3. Frontend (optional)
cd frontend
npm run dev
```

## Test API

```bash
curl -X POST http://localhost:5000/api/transactions/detect ^
  -H "Content-Type: application/json" ^
  -d @test-transaction.json
```

## WebSocket

```javascript
const socket = io('http://localhost:5000')
socket.on('real-time-stream', (data) => console.log(data))
```

## Fraud Rules

| Rule | Limit |
|------|-------|
| Single Transaction | 100,000 INR |
| Transactions/1min | 3 |
| Transactions/10min | 10 |
| Amount/24hr | 200,000 INR |
| Monthly Limit | 500,000 INR |

Edit: `backend/config/fraud-rules.js`

## Detection Flow

```
1. Static Rules → If fraud: STOP
2. Behavioral Analysis → If fraud: STOP  
3. ML Model → Always called
4. Log to DB → Always
5. WebSocket → Always
6. Update Profile → If not fraud
```

## Ports

- Backend: `5000`
- Frontend: `3000`
- gRPC ML: `50051`
- Prisma Studio: `5555`

## Key Files

- API Endpoint: `backend/controllers/fraud.controller.js`
- Detection Logic: `backend/services/fraud-detection.service.js`
- Fraud Rules: `backend/config/fraud-rules.js`
- ML Server: `ml-model/server.py`
- Proto File: `proto/fraud_detection.proto`
- Test Data: `test-transaction.json`

## Database

```bash
# View in Prisma Studio
cd backend
npm run prisma:studio

# Push schema changes
npm run prisma:push

# Generate client
npm run prisma:generate
```

## Common Issues

**gRPC not working?**
→ Start Python ML server: `cd ml-model && start-server.bat`

**Database error?**
→ Run: `cd backend && npx prisma db push`

**WebSocket not broadcasting?**
→ Check backend is running and Socket.io is initialized

## Response Format

```json
{
  "success": true,
  "transaction_id": "TXN123",
  "is_fraud": true/false,
  "risk_score": 0.0-1.0,
  "fraud_severity": "LOW|MEDIUM|HIGH",
  "flag_color": "GREEN|RED",
  "reason_of_fraud": "string"
}
```

## Documentation

- **FRAUD_DETECTION_GUIDE.md** - Complete guide
- **IMPLEMENTATION_COMPLETE.md** - What's been built
- **SIMPLIFIED_IMPLEMENTATION.md** - Technical details
