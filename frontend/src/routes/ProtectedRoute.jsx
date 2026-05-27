import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RoleLoading from '../components/common/RoleLoading'

/**
 * @prop {string} [role] — 'ADMIN' | 'LECTURER' | 'STUDENT'
 *   Pass the expected role so the loading animation uses the right accent color.
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Show role-specific loading animation while verifying token
  if (loading) {
    // Derive role from user if already known, or use the prop hint
    const loadingRole = user?.role ?? role ?? 'ADMIN'
    return <RoleLoading role={loadingRole} />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}