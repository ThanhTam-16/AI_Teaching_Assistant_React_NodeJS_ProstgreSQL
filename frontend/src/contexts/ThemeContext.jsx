import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const THEME_KEY = 'aita_theme'

export function ThemeProvider({ children, scope = 'app' }) {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      return stored !== null ? stored === 'true' : true // default dark for admin
    } catch {
      return true
    }
  })

  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d
      try { localStorage.setItem(THEME_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div data-theme={dark ? 'dark' : 'light'} className={dark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}