import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute   from './routes/ProtectedRoute'
import RoleRoute        from './routes/RoleRoute'
import { ROLES }        from './utils/constants'

// ── Public ────────────────────────────────────────────────────────────────────
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UnauthorizedPage   from './pages/UnauthorizedPage'
import NotFoundPage       from './pages/NotFoundPage'

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminLayout              from './features/admin/layouts/AdminLayout'
import AdminOverviewPage        from './features/admin/pages/AdminOverviewPage'
import UserManagementPage       from './features/admin/pages/UserManagementPage'
import { LecturerManagementPage, StudentManagementPage } from './features/admin/pages/RolePages'
import SubjectManagementPage    from './features/admin/pages/SubjectManagementPage'
import AISettingsPage           from './features/admin/pages/AISettingsPage'
import SystemSettingsPage       from './features/admin/pages/SystemSettingsPage'

// ── Lecturer / Student (placeholders — untouched) ─────────────────────────────
import LecturerOverviewPage from './features/lecturer/pages/LecturerOverviewPage'
import StudentOverviewPage  from './features/student/pages/StudentOverviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/*
          Sonner Toaster — dark/light auto-detects via theme attr on parent div.
          For admin pages the ThemeProvider wraps content, so toaster reads
          system preference here. Admin-scoped dark mode is handled by ThemeProvider.
        */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontSize: '12px' },
            duration: 3500,
          }}
        />

        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized"    element={<UnauthorizedPage />} />

          {/* ── Admin (nested layout with Outlet) ──────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index                element={<AdminOverviewPage />} />
            <Route path="users"         element={<UserManagementPage />} />
            <Route path="lecturers"     element={<LecturerManagementPage />} />
            <Route path="students"      element={<StudentManagementPage />} />
            <Route path="subjects"      element={<SubjectManagementPage />} />
            <Route path="ai-settings"   element={<AISettingsPage />} />
            <Route path="settings"      element={<SystemSettingsPage />} />
          </Route>

          {/* ── Lecturer ───────────────────────────────────────── */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute role="LECTURER">
                <RoleRoute allowedRoles={[ROLES.LECTURER]}>
                  <LecturerOverviewPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ── Student ────────────────────────────────────────── */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                  <StudentOverviewPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}