import React, { createContext, useState, useEffect, useCallback } from 'react'
import { storage } from '../utils/storage'
import { getMeApi, logoutApi } from '../services/auth.api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => storage.getUser())
  const [token,   setToken]   = useState(() => storage.getToken())
  const [loading, setLoading] = useState(true)  // verifying token on mount

  // On mount: if we have a token, verify it with /auth/me
  useEffect(() => {
    const verify = async () => {
      if (!storage.getToken()) { setLoading(false); return }
      try {
        const res = await getMeApi()
        const freshUser = res.data.data
        setUser(freshUser)
        storage.setUser(freshUser)
      } catch {
        // token invalid/expired
        storage.clear()
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  const login = useCallback((tokenVal, userData) => {
    storage.setToken(tokenVal)
    storage.setUser(userData)
    setToken(tokenVal)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    try { await logoutApi() } catch { /* ignore */ }
    storage.clear()
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}