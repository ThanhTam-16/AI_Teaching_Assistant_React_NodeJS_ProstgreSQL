import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getRoleRedirectPath } from '../utils/roleRedirect'

export default function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={getRoleRedirectPath(user?.role)} replace />
  }
  return children
}