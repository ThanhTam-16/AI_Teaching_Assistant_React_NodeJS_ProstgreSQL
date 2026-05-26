import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute   from './routes/ProtectedRoute'
import RoleRoute        from './routes/RoleRoute'
import { ROLES }        from './utils/constants'

// Pages
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UnauthorizedPage   from './pages/UnauthorizedPage'
import NotFoundPage       from './pages/NotFoundPage'

// Feature pages
import AdminOverviewPage    from './features/admin/pages/AdminOverviewPage'
import LecturerOverviewPage from './features/lecturer/pages/LecturerOverviewPage'
import StudentOverviewPage  from './features/student/pages/StudentOverviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public ───────────────────────────────────────── */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized"    element={<UnauthorizedPage />} />

          {/* ── Admin ────────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminOverviewPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Lecturer ─────────────────────────────────────── */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.LECTURER]}>
                  <LecturerOverviewPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Student ──────────────────────────────────────── */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                  <StudentOverviewPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ─────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}