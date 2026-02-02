# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Setup Environment Variables

**Backend (.env already created):**
```bash
# backend/.env is already configured with your PostgreSQL database
```

**Frontend:**
```bash
copy frontend\.env.example frontend\.env
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Push schema to database (already done)
npm run prisma:push

# Optional: Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Run the Application

**Option 1: Run both frontend and backend together (from root):**
```bash
npm run dev
```

**Option 2: Run separately:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Prisma Studio**: Run `npm run prisma:studio` in backend folder

## Database Structure

The application uses **PostgreSQL** (Neon Database) with **Prisma ORM**.

### Current Schema:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Backend Architecture

```
backend/
├── lib/prisma.js              # Prisma client singleton
├── repositories/              # Database access layer
│   └── user.repository.js
├── services/                  # Business logic layer
│   └── auth.service.js
├── controllers/               # Request handlers
│   └── auth.controller.js
├── middleware/                # Express middleware
├── routes/                    # Route definitions
├── prisma/
│   └── schema.prisma         # Database schema
└── server.js                 # Entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/signin` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user (requires Bearer token)
  ```
  Headers: Authorization: Bearer <token>
  ```

## Adding New Features

### 1. Update Database Schema

Edit `backend/prisma/schema.prisma`:
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}
```

Then push changes:
```bash
cd backend
npm run prisma:push
```

### 2. Create Repository

```javascript
// backend/repositories/post.repository.js
import prisma from '../lib/prisma.js'

export class PostRepository {
  async findAll() {
    return await prisma.post.findMany()
  }
}

export default new PostRepository()
```

### 3. Create Service

```javascript
// backend/services/post.service.js
import postRepository from '../repositories/post.repository.js'

export class PostService {
  async getAllPosts() {
    return await postRepository.findAll()
  }
}

export default new PostService()
```

### 4. Create Controller & Routes

Follow the pattern in `auth.controller.js` and `auth.routes.js`

## Troubleshooting

### Database Connection Issues
```bash
cd backend
npx prisma db push
```

### Prisma Client Not Generated
```bash
cd backend
npm run prisma:generate
```

### Port Already in Use
Change ports in:
- `backend/.env` - PORT=5000
- `frontend/vite.config.js` - port: 3000

## Production Deployment

1. Set `NODE_ENV=production` in backend
2. Use `npm run prisma:migrate` instead of `prisma:push`
3. Build frontend: `cd frontend && npm run build`
4. Serve frontend build with a static server or CDN
