# Full-Stack Authentication App

A complete full-stack application with authentication, built with React (Vite), Express.js, and Prisma ORM with PostgreSQL.

## 🚀 Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

```bash
# Install all dependencies
npm run install:all

# Setup database (backend folder)
cd backend
npm run prisma:generate
npm run prisma:push
cd ..

# Run both frontend and backend
npm run dev
```

## ✨ Features

- **Frontend**: React with Vite, Shadcn UI components, Tailwind CSS
- **Backend**: Express.js with modular architecture
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: JWT-based authentication
- **Theme**: Light/Dark mode toggle
- **Real-time**: Socket.io integration ready
- **Modular Design**: Repository → Service → Controller pattern

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Shadcn UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   └── user.model.js      # In-memory storage (replace with DB)
│   ├── routes/
│   │   └── auth.routes.js
│   ├── config/
│   │   └── database.js        # Database config placeholder
│   ├── utils/
│   │   └── socket.js
│   ├── server.js
│   └── package.json
│
└── package.json

```

## Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

   Or install separately:
   ```bash
   # Root
   npm install

   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

2. **Setup environment variables:**

   Frontend (.env in frontend/):
   ```bash
   cp frontend/.env.example frontend/.env
   ```

   Backend (.env in backend/):
   ```bash
   cp backend/.env.example backend/.env
   ```

   Update `backend/.env` with your JWT secret:
   ```
   JWT_SECRET=your_secure_secret_key_here
   ```

## Running the Application

**Development mode (both frontend and backend):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Frontend (http://localhost:3000)
npm run dev:frontend

# Backend (http://localhost:5000)
npm run dev:backend
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Protected Routes Example
```javascript
import { authenticate } from './middleware/auth.middleware.js'

// Only authenticated users
router.get('/profile', authenticate, getProfile)
router.get('/data', authenticate, getData)
```

## Database Integration

The app uses **Prisma ORM** with **PostgreSQL** (Neon Database).

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (for development)
npm run prisma:push

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

### Database Structure

The backend follows a modular architecture:

- **`lib/prisma.js`** - Prisma client singleton
- **`repositories/`** - Database access layer
- **`services/`** - Business logic layer
- **`controllers/`** - Request handlers
- **`prisma/schema.prisma`** - Database schema

### Modifying the Schema

1. Edit `backend/prisma/schema.prisma`
2. Run `npm run prisma:push` (development) or `npm run prisma:migrate` (production)
3. Prisma Client will auto-update

## Socket.io Usage

Socket.io is configured and ready to use. Example:

```javascript
import { emitToUser, emitToRole } from '../utils/socket.js'

export const someController = async (req, res) => {
  const io = req.app.get('io')
  
  // Emit to specific user
  emitToUser(io, userId, 'notification', { message: 'Hello!' })
  
  // Emit to role
  emitToRole(io, 'bank', 'update', { data: 'New data' })
}
```

## Adding New Routes

1. Create controller in `backend/controllers/`
2. Create route file in `backend/routes/`
3. Import and use in `backend/server.js`

Example:
```javascript
// backend/routes/data.routes.js
import express from 'express'
import { authenticate, authorize } from '../middleware/auth.middleware.js'
import { getData } from '../controllers/data.controller.js'

const router = express.Router()

router.get('/', authenticate, authorize('bank', 'branch'), getData)

export default router
```

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Shadcn UI
- Radix UI
- Lucide React (icons)

### Backend
- Express.js
- JWT (jsonwebtoken)
- bcryptjs
- Socket.io
- Express Validator
- Helmet (security)
- Morgan (logging)
- CORS

## License

ISC
