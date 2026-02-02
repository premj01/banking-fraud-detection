# 🚀 Quick Start Guide

## ✅ Current Status

- ✅ **Backend**: Running on http://localhost:5000
- ✅ **Frontend**: Running on http://localhost:3000
- ✅ **Database**: PostgreSQL (Neon) - Connected

## 🎯 Access Your Application

1. **Open your browser**: http://localhost:3000
2. **Sign Up**: Create a new account
3. **Sign In**: Login with your credentials
4. **Dashboard**: Access your protected dashboard

## 🔧 If You Need to Restart

### Option 1: Run Both Together (Recommended)
```bash
# From root directory
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📊 View Your Database

Open Prisma Studio (Database GUI):
```bash
cd backend
npm run prisma:studio
```

Opens at: http://localhost:5555

## 🧪 Test API Endpoints

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Get Current User (replace YOUR_TOKEN)
```bash
curl http://localhost:5000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛑 Stop Servers

Press `Ctrl + C` in each terminal window

## 📝 Common Commands

### Backend
```bash
cd backend

# Start development server
npm run dev

# View database
npm run prisma:studio

# Update database schema
npm run prisma:push

# Generate Prisma Client
npm run prisma:generate

# Test database connection
node test-db.js
```

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔍 Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Database Connection Error
```bash
cd backend
npx prisma db push
```

### Prisma Client Not Found
```bash
cd backend
npm run prisma:generate
```

### Frontend Can't Connect to Backend
1. Check backend is running: http://localhost:5000/api/health
2. Check `frontend/.env` has: `VITE_API_URL=http://localhost:5000/api`
3. Restart frontend

## 📚 Documentation

- **README.md** - Project overview
- **SETUP.md** - Detailed setup instructions
- **PROJECT_STRUCTURE.md** - Architecture details
- **INTEGRATION_COMPLETE.md** - Database integration guide
- **backend/README.md** - Backend documentation

## 🎨 Features to Try

1. **Sign Up** - Create a new account
2. **Sign In** - Login with credentials
3. **Dashboard** - View protected content
4. **Theme Toggle** - Switch between light/dark mode
5. **Logout** - Sign out from the app

## 🚀 Next Steps

1. **Customize the UI** - Edit components in `frontend/src/`
2. **Add Features** - Follow guides in `PROJECT_STRUCTURE.md`
3. **Add Database Models** - Edit `backend/prisma/schema.prisma`
4. **Deploy** - See deployment guides in documentation

---

**🎉 Your application is ready to use!**

**Frontend**: http://localhost:3000
**Backend**: http://localhost:5000
**Database**: Connected ✅
