import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Shows a minimal spinner while token is being verified
function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fpt-pastel">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-fpt-pale border-t-fpt-orange animate-spin" />
        <span className="text-sm text-gray-400 font-medium">Đang xác thực…</span>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}