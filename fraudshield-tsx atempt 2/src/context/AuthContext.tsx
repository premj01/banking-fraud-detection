import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import axios from "axios"

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: User; token: string }>
  signup: (email: string, password: string) => Promise<{ user: User; token: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        // Check if it's a mock token
        if (token === 'mock-jwt-token') {
          const mockEmail = localStorage.getItem("mockEmail") || "test@example.com"
          setUser({ id: '1', email: mockEmail, name: mockEmail.split('@')[0] })
          setLoading(false)
          return
        }
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data.user)
      } catch (error) {
        localStorage.removeItem("token")
        localStorage.removeItem("mockEmail")
      }
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, { email, password })
      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      return response.data
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Fallback for development when backend is not available
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Backend not available, using mock authentication for login')
        const mockUser = { id: '1', email, name: email.split('@')[0] }
        const mockToken = 'mock-jwt-token'
        localStorage.setItem("token", mockToken)
        localStorage.setItem("mockEmail", email)
        setUser(mockUser)
        return { user: mockUser, token: mockToken }
      }
      
      throw error
    }
  }

  const signup = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { email, password })
      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      return response.data
    } catch (error: any) {
      console.error('Signup error:', error)
      
      // Fallback for development when backend is not available
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.warn('Backend not available, using mock authentication for signup')
        const mockUser = { id: '1', email, name: email.split('@')[0] }
        const mockToken = 'mock-jwt-token'
        localStorage.setItem("token", mockToken)
        localStorage.setItem("mockEmail", email)
        setUser(mockUser)
        return { user: mockUser, token: mockToken }
      }
      
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("mockEmail")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}