import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { Navbar } from "@/components/Navbar"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Home } from "@/pages/Home"
import { SignIn } from "@/pages/SignIn"
import { SignUp } from "@/pages/SignUp"
import Dashboard from "@/pages/Dashboard"
import Monitoring from "@/pages/Monitoring"
import Analytics from "@/pages/Analytics"
import DrillDown from "@/pages/DrillDown"
import Investigators from "@/pages/Investigators"
import Model from "@/pages/Model"
import Alerts from "@/pages/Alerts"
import Settings from "@/pages/Settings"
import GraphAnalysis from "@/pages/GraphAnalysis"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen">
            <Routes>
              {/* Public Routes with Navbar */}
              <Route path="/" element={<><Navbar /><Home /></>} />
              <Route path="/signin" element={<><Navbar /><SignIn /></>} />
              <Route path="/signup" element={<><Navbar /><SignUp /></>} />

              {/* Protected Dashboard Routes (Navbar hidden, handled by DashboardLayout) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <ProtectedRoute>
                    <Monitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/drilldown"
                element={
                  <ProtectedRoute>
                    <DrillDown />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/investigators"
                element={
                  <ProtectedRoute>
                    <Investigators />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/model"
                element={
                  <ProtectedRoute>
                    <Model />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <Alerts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/graph-analysis"
                element={
                  <ProtectedRoute>
                    <GraphAnalysis />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
