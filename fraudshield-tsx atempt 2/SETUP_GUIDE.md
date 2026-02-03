# FraudShield Setup Guide

This guide will help you set up the complete FraudShield application with authentication and dashboard functionality.

## Quick Start

### 1. Frontend Setup (Current Directory)

The frontend is already configured with:
- ✅ React + TypeScript + Vite
- ✅ shadcn/ui components
- ✅ Authentication system (SignIn/SignUp)
- ✅ Protected routes
- ✅ Complete dashboard with fraud detection UI
- ✅ Theme support (dark/light)
- ✅ Responsive design

**Start the frontend:**
```bash
npm run dev
```

The application will be available at: http://localhost:8080

### 2. Backend Setup (Required for Authentication)

Navigate to the backend folder and start the API server:

```bash
cd ../backend
npm install
npm run dev
```

The backend API will be available at: http://localhost:5000

### 3. Database Setup

The backend uses Prisma with your configured database. Make sure to:

1. Set up your database connection in `backend/.env`
2. Run database migrations:
   ```bash
   cd ../backend
   npx prisma migrate dev
   ```

## Application Flow

### 1. Landing Page
- Visit http://localhost:8080/home
- Beautiful landing page with feature overview
- Sign up or sign in options

### 2. Authentication
- **Sign Up**: `/signup` - Create new account with password validation
- **Sign In**: `/signin` - Login with existing credentials
- **Protected Routes**: All dashboard routes require authentication

### 3. Dashboard Access
After authentication, users are redirected to the main dashboard:
- **Overview** (`/`) - Main dashboard with KPIs, charts, and alerts
- **Real-time Monitoring** (`/monitoring`) - Live transaction monitoring
- **Analytics** (`/analytics`) - Advanced analytics and reporting
- **Drill-down** (`/drilldown`) - Investigation tools
- **Investigators** (`/investigators`) - Team management
- **Model** (`/model`) - AI model configuration
- **Alerts** (`/alerts`) - Alert management
- **Settings** (`/settings`) - Application settings

## Features Implemented

### 🔐 Authentication System
- [x] User registration with email/password
- [x] Strong password validation with visual feedback
- [x] Secure login with JWT tokens
- [x] Session persistence
- [x] Protected route system
- [x] User profile management
- [x] Logout functionality

### 🎨 UI/UX Components
- [x] Modern shadcn/ui component library
- [x] Dark/light theme toggle
- [x] Responsive design for all screen sizes
- [x] Glass morphism design effects
- [x] Smooth animations and transitions
- [x] Accessible components with proper ARIA labels

### 📊 Dashboard Features
- [x] Real-time KPI cards
- [x] Interactive fraud trend charts
- [x] Risk distribution visualization
- [x] Geographic heatmaps
- [x] Live alerts feed
- [x] Transaction monitoring
- [x] Advanced filtering and search

### 🛡️ Fraud Detection UI
- [x] Risk level indicators (High/Medium/Low)
- [x] Transaction scoring visualization
- [x] Alert management system
- [x] Investigation workflow
- [x] Pattern analysis tools
- [x] Reporting capabilities

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (../backend/.env)
```
DATABASE_URL="your-database-connection-string"
JWT_SECRET="your-jwt-secret"
PORT=5000
```

## Development Workflow

### 1. Start Backend
```bash
cd ../backend
npm run dev
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- Landing page: http://localhost:8080/home
- Sign in: http://localhost:8080/signin
- Dashboard: http://localhost:8080/ (requires authentication)

## Testing the Application

### 1. Create Test Account
1. Go to http://localhost:8080/signup
2. Enter email and strong password
3. Account will be created and you'll be logged in automatically

### 2. Explore Dashboard
1. Navigate through different sections using the sidebar
2. Test the responsive design on different screen sizes
3. Try the theme toggle (dark/light mode)
4. Explore the interactive charts and components

### 3. Test Authentication
1. Log out using the user menu
2. Try accessing protected routes (should redirect to sign in)
3. Log back in and verify session persistence

## Customization

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation in `src/components/layout/Sidebar.tsx`

### Modifying UI Components
- All shadcn/ui components are in `src/components/ui/`
- Customize themes in `src/index.css`
- Modify layouts in `src/components/layout/`

### API Integration
- Authentication context: `src/context/AuthContext.tsx`
- API calls use axios with base URL from environment

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running on port 5000
2. **Authentication Issues**: Check JWT_SECRET in backend .env
3. **Database Errors**: Verify database connection and run migrations
4. **Build Errors**: Clear node_modules and reinstall dependencies

### Getting Help

1. Check browser console for errors
2. Verify both frontend and backend are running
3. Check network tab for API call failures
4. Ensure environment variables are set correctly

## Production Deployment

### Frontend Build
```bash
npm run build
```

### Environment Variables
Set production API URL:
```
VITE_API_URL=https://your-api-domain.com/api
```

The application is now fully functional with complete authentication flow and fraud detection dashboard!