# Backend - Modular Express.js with Prisma

A modular Express.js backend with Prisma ORM and PostgreSQL.

## Architecture

```
backend/
├── lib/
│   └── prisma.js              # Prisma client singleton
├── repositories/
│   └── user.repository.js     # Database access layer
├── services/
│   └── auth.service.js        # Business logic layer
├── controllers/
│   └── auth.controller.js     # Request handlers
├── middleware/
│   ├── auth.middleware.js     # JWT authentication
│   ├── error.middleware.js    # Error handling
│   └── validation.middleware.js
├── routes/
│   └── auth.routes.js         # Route definitions
├── utils/
│   └── socket.js              # Socket.io utilities
├── prisma/
│   └── schema.prisma          # Database schema
└── server.js                  # Application entry point
```

## Modular Design Pattern

### 1. Repository Layer (`repositories/`)
- Direct database access using Prisma
- CRUD operations
- Database queries

### 2. Service Layer (`services/`)
- Business logic
- Data validation
- Token generation
- Password hashing

### 3. Controller Layer (`controllers/`)
- HTTP request/response handling
- Input validation
- Error handling
- Calls service layer

### 4. Route Layer (`routes/`)
- Route definitions
- Middleware application
- Request validation rules

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

4. **Push schema to database:**
   ```bash
   npm run prisma:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema changes (development)
npm run prisma:push

# Create migration (production)
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio
```

## Adding New Features

### 1. Create Repository
```javascript
// repositories/post.repository.js
import prisma from '../lib/prisma.js'

export class PostRepository {
  async findAll() {
    return await prisma.post.findMany()
  }
  
  async create(data) {
    return await prisma.post.create({ data })
  }
}

export default new PostRepository()
```

### 2. Create Service
```javascript
// services/post.service.js
import postRepository from '../repositories/post.repository.js'

export class PostService {
  async getAllPosts() {
    return await postRepository.findAll()
  }
  
  async createPost(data) {
    // Business logic here
    return await postRepository.create(data)
  }
}

export default new PostService()
```

### 3. Create Controller
```javascript
// controllers/post.controller.js
import postService from '../services/post.service.js'

export const getPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts()
    res.json({ success: true, posts })
  } catch (error) {
    next(error)
  }
}
```

### 4. Create Routes
```javascript
// routes/post.routes.js
import express from 'express'
import { getPosts } from '../controllers/post.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = express.Router()
router.get('/', authenticate, getPosts)

export default router
```

### 5. Register Routes
```javascript
// server.js
import postRoutes from './routes/post.routes.js'
app.use('/api/posts', postRoutes)
```

## Database Schema

Edit `prisma/schema.prisma` to modify your database structure:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then run:
```bash
npm run prisma:push
```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
DATABASE_URL="postgresql://..."
```
