# Project Structure & Architecture

## 📁 Complete Project Structure

```
fullstack-auth-app/
│
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn UI Components
│   │   │   │   ├── button.jsx
│   │   │   │   ├── card.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── label.jsx
│   │   │   │   └── dropdown-menu.jsx
│   │   │   ├── Navbar.jsx            # Navigation with user menu
│   │   │   ├── ProtectedRoute.jsx    # Route protection
│   │   │   └── ThemeToggle.jsx       # Dark/Light mode toggle
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   └── ThemeContext.jsx      # Theme state
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── SignIn.jsx            # Login page
│   │   │   ├── SignUp.jsx            # Registration page
│   │   │   └── Dashboard.jsx         # Protected dashboard
│   │   │
│   │   ├── lib/
│   │   │   └── utils.js              # Utility functions
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles + Tailwind
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/                           # Express.js Backend
│   ├── lib/
│   │   └── prisma.js                 # Prisma client singleton
│   │
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   │
│   ├── repositories/                 # Data Access Layer
│   │   └── user.repository.js        # User database operations
│   │
│   ├── services/                     # Business Logic Layer
│   │   └── auth.service.js           # Authentication logic
│   │
│   ├── controllers/                  # Request Handlers
│   │   └── auth.controller.js        # Auth endpoints
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── error.middleware.js       # Error handling
│   │   └── validation.middleware.js  # Input validation
│   │
│   ├── routes/
│   │   └── auth.routes.js            # Auth route definitions
│   │
│   ├── utils/
│   │   └── socket.js                 # Socket.io utilities
│   │
│   ├── server.js                     # Application entry point
│   ├── test-db.js                    # Database test script
│   ├── .env                          # Environment variables
│   └── package.json
│
├── package.json                       # Root package.json
├── README.md                          # Main documentation
├── SETUP.md                           # Setup instructions
├── PROJECT_STRUCTURE.md               # This file
└── .gitignore

```

## 🏗️ Backend Architecture (Modular Design)

### Layer 1: Repository Layer
**Purpose**: Direct database access using Prisma
**Location**: `backend/repositories/`

```javascript
// Example: user.repository.js
export class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } })
  }
  
  async create(data) {
    return await prisma.user.create({ data })
  }
}
```

**Responsibilities**:
- CRUD operations
- Database queries
- Data retrieval
- No business logic

### Layer 2: Service Layer
**Purpose**: Business logic and data processing
**Location**: `backend/services/`

```javascript
// Example: auth.service.js
export class AuthService {
  async signup(email, password) {
    // Check if user exists
    // Hash password
    // Create user via repository
    // Generate JWT token
    return { token, user }
  }
}
```

**Responsibilities**:
- Business rules
- Data validation
- Password hashing
- Token generation
- Calls repository layer

### Layer 3: Controller Layer
**Purpose**: HTTP request/response handling
**Location**: `backend/controllers/`

```javascript
// Example: auth.controller.js
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const result = await authService.signup(email, password)
    res.status(201).json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}
```

**Responsibilities**:
- Parse request data
- Call service layer
- Format responses
- Error handling

### Layer 4: Route Layer
**Purpose**: Route definitions and middleware
**Location**: `backend/routes/`

```javascript
// Example: auth.routes.js
router.post('/signup', signupValidation, validate, signup)
router.post('/signin', signinValidation, validate, signin)
router.get('/me', authenticate, getMe)
```

**Responsibilities**:
- Define endpoints
- Apply middleware
- Validation rules
- Route protection

## 🗄️ Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### Adding New Models

1. Edit `backend/prisma/schema.prisma`
2. Run `npm run prisma:push` (development)
3. Run `npm run prisma:generate` to update Prisma Client

Example - Adding Posts:
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  posts     Post[]   // Add this relation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## 🎨 Frontend Architecture

### Context Providers
- **AuthContext**: Manages user authentication state
- **ThemeContext**: Manages dark/light theme

### Protected Routes
```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### API Communication
Uses Axios with base URL from environment variables:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
```

## 🔐 Authentication Flow

### Sign Up
1. User submits email + password
2. Frontend → POST `/api/auth/signup`
3. Controller → Service → Repository
4. Hash password with bcrypt
5. Create user in database
6. Generate JWT token
7. Return token + user data
8. Frontend stores token in localStorage

### Sign In
1. User submits credentials
2. Frontend → POST `/api/auth/signin`
3. Find user by email
4. Verify password with bcrypt
5. Generate JWT token
6. Return token + user data

### Protected Routes
1. Frontend sends token in Authorization header
2. Backend middleware verifies JWT
3. Attach user data to request
4. Continue to route handler

## 🚀 Data Flow Example

**Creating a new feature (e.g., Posts)**

1. **Update Schema**
```prisma
model Post {
  id      String @id @default(cuid())
  title   String
  content String
  userId  String
  user    User   @relation(fields: [userId], references: [id])
}
```

2. **Create Repository**
```javascript
// repositories/post.repository.js
export class PostRepository {
  async findAll() {
    return await prisma.post.findMany()
  }
  async create(data) {
    return await prisma.post.create({ data })
  }
}
```

3. **Create Service**
```javascript
// services/post.service.js
export class PostService {
  async createPost(userId, title, content) {
    return await postRepository.create({
      userId, title, content
    })
  }
}
```

4. **Create Controller**
```javascript
// controllers/post.controller.js
export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body
    const post = await postService.createPost(
      req.user.id, title, content
    )
    res.json({ success: true, post })
  } catch (error) {
    next(error)
  }
}
```

5. **Create Routes**
```javascript
// routes/post.routes.js
router.post('/', authenticate, createPost)
```

6. **Register in Server**
```javascript
// server.js
import postRoutes from './routes/post.routes.js'
app.use('/api/posts', postRoutes)
```

## 🛠️ Development Workflow

### Backend Development
```bash
cd backend

# Watch mode
npm run dev

# View database
npm run prisma:studio

# Update schema
npm run prisma:push
```

### Frontend Development
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build
```

## 📦 Key Dependencies

### Backend
- **express**: Web framework
- **@prisma/client**: Database ORM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT tokens
- **socket.io**: Real-time communication
- **express-validator**: Input validation
- **helmet**: Security headers
- **cors**: Cross-origin requests

### Frontend
- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS
- **lucide-react**: Icons

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- HTTP-only recommendations for cookies
- Helmet.js security headers
- CORS configuration
- Input validation with express-validator
- SQL injection prevention (Prisma)
- XSS protection (React)

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
DATABASE_URL="postgresql://..."
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📝 Best Practices Implemented

1. **Separation of Concerns**: Repository → Service → Controller
2. **Single Responsibility**: Each layer has one job
3. **Dependency Injection**: Services injected into controllers
4. **Error Handling**: Centralized error middleware
5. **Validation**: Input validation at route level
6. **Security**: JWT, bcrypt, helmet, CORS
7. **Code Reusability**: Shared utilities and components
8. **Type Safety**: Prisma provides type-safe database access
9. **Environment Configuration**: Separate dev/prod configs
10. **Graceful Shutdown**: Proper database disconnection
