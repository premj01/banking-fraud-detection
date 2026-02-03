# FraudShield - Advanced Fraud Detection Dashboard

A comprehensive fraud detection and prevention platform built with React, TypeScript, and shadcn/ui components. This application provides real-time transaction monitoring, AI-powered fraud detection, and advanced analytics for financial institutions.

## Features

### 🔐 Authentication System
- **Secure Login/Signup**: Email and password authentication with validation
- **Protected Routes**: Route-level protection for authenticated users
- **Session Management**: Persistent login sessions with token-based authentication
- **Password Security**: Strong password requirements with visual feedback

### 📊 Dashboard & Analytics
- **Real-time Monitoring**: Live transaction monitoring with instant fraud detection
- **Interactive Charts**: Comprehensive data visualization using Recharts
- **Risk Assessment**: Multi-level risk categorization (High, Medium, Low)
- **Geographic Heatmaps**: Location-based fraud pattern analysis
- **Trend Analysis**: Historical data analysis and pattern recognition

### 🛡️ Fraud Detection
- **AI-Powered Detection**: Machine learning algorithms for pattern recognition
- **Smart Alerts**: Intelligent alerting system with customizable thresholds
- **Investigation Tools**: Detailed drill-down capabilities for suspicious transactions
- **Team Collaboration**: Multi-user investigation and case management

### 🎨 Modern UI/UX
- **shadcn/ui Components**: Beautiful, accessible, and customizable UI components
- **Dark/Light Theme**: System-aware theme switching
- **Responsive Design**: Mobile-first responsive layout
- **Glass Morphism**: Modern glass-effect design elements
- **Smooth Animations**: Fluid transitions and micro-interactions

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

### UI Framework
- **shadcn/ui** - High-quality React components
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library

### Data Visualization
- **Recharts** - Composable charting library
- **Custom Charts** - Specialized fraud detection visualizations

### Form Management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

## Project Structure

```
fraudshield-tsx/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── layout/             # Layout components (Sidebar, Header)
│   │   ├── ProtectedRoute.tsx  # Route protection
│   │   ├── ThemeToggle.tsx     # Theme switcher
│   │   └── Navbar.tsx          # Navigation component
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   └── ThemeContext.tsx    # Theme state management
│   ├── pages/
│   │   ├── Home.tsx           # Landing page
│   │   ├── SignIn.tsx         # Login page
│   │   ├── SignUp.tsx         # Registration page
│   │   ├── Overview.tsx       # Main dashboard
│   │   ├── Monitoring.tsx     # Real-time monitoring
│   │   ├── Analytics.tsx      # Analytics dashboard
│   │   ├── DrillDown.tsx      # Investigation tools
│   │   ├── Investigators.tsx  # Team management
│   │   ├── Model.tsx          # AI model management
│   │   ├── Alerts.tsx         # Alert management
│   │   └── Settings.tsx       # Application settings
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   └── mockData.ts        # Mock data generators
│   ├── types/
│   │   └── fraud.ts           # TypeScript type definitions
│   └── hooks/
│       └── use-toast.ts       # Toast notification hook
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server (see backend folder)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fraudshield-tsx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Authentication Flow

### User Registration
1. Navigate to `/signup`
2. Enter email and password (with strength validation)
3. Confirm password
4. Account created and automatically logged in
5. Redirected to dashboard

### User Login
1. Navigate to `/signin`
2. Enter credentials
3. Token stored in localStorage
4. Redirected to intended page or dashboard

### Route Protection
- All dashboard routes require authentication
- Unauthenticated users redirected to sign-in
- Authentication state persisted across sessions

## Dashboard Features

### Overview Page
- **KPI Cards**: Key performance indicators
- **Fraud Trend Chart**: 14-day transaction and fraud trends
- **Risk Distribution**: Pie chart of risk levels
- **Live Alerts**: Recent fraud alerts
- **Transaction Volume**: Hourly activity chart
- **Geographic Heatmap**: Fraud distribution by location
- **Recent Transactions**: Latest flagged transactions

### Real-time Monitoring
- Live transaction feed
- Real-time risk scoring
- Instant fraud alerts
- Transaction filtering and search

### Analytics Dashboard
- Historical trend analysis
- Pattern recognition
- Performance metrics
- Custom date ranges
- Export capabilities

### Investigation Tools
- Transaction drill-down
- User behavior analysis
- Network analysis
- Evidence collection
- Case management

## API Integration

The frontend integrates with a Node.js/Express backend:

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user

### Data Endpoints
- `GET /api/transactions` - Transaction data
- `GET /api/alerts` - Fraud alerts
- `GET /api/analytics` - Analytics data

## Customization

### Theme Customization
The application uses CSS custom properties for theming:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  /* ... more variables */
}
```

### Component Customization
All shadcn/ui components can be customized by modifying the component files in `src/components/ui/`.

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in `Sidebar.tsx`
4. Wrap with `ProtectedRoute` if authentication required

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set the following environment variables for production:
- `VITE_API_URL` - Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.