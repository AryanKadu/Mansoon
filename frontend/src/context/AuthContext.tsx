import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  _id: string
  name: string
  email: string
  username: string
  mobile?: string
  admin?: boolean | number
  addresses?: {
    _id?: string
    fullName: string
    street: string
    city: string
    state: string
    pincode: string
    mobile: string
  }[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>
  register: (data: RegisterData) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  username: string
  password: string
  password2: string
  mobile: string
}

const AuthContext = createContext<AuthContextType | null>(null)

import { config } from '../config';
const API = config.API_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetch(`${API}/api/me`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(data.user)
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Login failed' }
  }

  const register = async (formData: RegisterData) => {
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (res.ok) return { ok: true }
    return { ok: false, message: data.message || 'Registration failed' }
  }

  const logout = async () => {
    await fetch(`${API}/api/logout`, { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
