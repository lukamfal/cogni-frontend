'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, User } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('cogni_token')
    if (!token) { setLoading(false); return }
    api.auth.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('cogni_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    localStorage.setItem('cogni_token', res.access_token)
    setUser(res.user)
    router.push('/dashboard')
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password })
    localStorage.setItem('cogni_token', res.access_token)
    setUser(res.user)
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('cogni_token')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
