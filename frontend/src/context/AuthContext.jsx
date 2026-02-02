import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data.user)
      } catch (error) {
        localStorage.removeItem("token")
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/signin`, { email, password })
    localStorage.setItem("token", response.data.token)
    setUser(response.data.user)
    return response.data
  }

  const signup = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/signup`, { email, password })
    localStorage.setItem("token", response.data.token)
    setUser(response.data.user)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem("token")
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
