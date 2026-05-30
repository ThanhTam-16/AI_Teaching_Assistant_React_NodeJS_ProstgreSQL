import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute     from './routes/RoleRoute'
import { ROLES }     from './utils/constants'

// ── Public ────────────────────────────────────────────────────────────────────
import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UnauthorizedPage   from './pages/UnauthorizedPage'
import NotFoundPage       from './pages/NotFoundPage'

// ── Admin ─────────────────────────────────────────────────────────────────────
import AdminLayout           from './features/admin/layouts/AdminLayout'
import AdminOverviewPage     from './features/admin/pages/AdminOverviewPage'
import UserManagementPage    from './features/admin/pages/UserManagementPage'
import { LecturerManagementPage, StudentManagementPage } from './features/admin/pages/RolePages'
import AdminSubjectPage      from './features/admin/pages/SubjectManagementPage'
import AISettingsPage        from './features/admin/pages/AISettingsPage'
import SystemSettingsPage    from './features/admin/pages/SystemSettingsPage'

// ── Lecturer ──────────────────────────────────────────────────────────────────
import LecturerLayout           from './features/lecturer/layouts/LecturerLayout'
import LecturerOverviewPage     from './features/lecturer/pages/LecturerOverviewPage'
import ClassManagementPage      from './features/lecturer/pages/ClassManagementPage'
import LecturerSubjectPage      from './features/lecturer/pages/LecturerSubjectPage'
import CLOManagementPage        from './features/lecturer/pages/CLOManagementPage'
import LessonManagementPage     from './features/lecturer/pages/LessonManagementPage'
import AssignmentManagementPage from './features/lecturer/pages/AssignmentManagementPage'
import { SubmissionManagementPage, GradingPage } from './features/lecturer/pages/SubmissionPages'
import {
  AIExerciseGeneratorPage,
  AIQuizGeneratorPage,
  AIFeedbackGeneratorPage,
  AISlideGeneratorPage,
} from './features/lecturer/pages/ai/AIPages'
import LecturerReportPage from './features/lecturer/pages/LecturerReportPage'

// ── Student (placeholder) ─────────────────────────────────────────────────────
import StudentOverviewPage from './features/student/pages/StudentOverviewPage'

import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ style: { fontSize: '12px' }, duration: 3500 }}
        />

        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized"    element={<UnauthorizedPage />} />

          {/* ── Admin ──────────────────────────────────────────── */}
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
            <Route index              element={<AdminOverviewPage />} />
            <Route path="users"       element={<UserManagementPage />} />
            <Route path="lecturers"   element={<LecturerManagementPage />} />
            <Route path="students"    element={<StudentManagementPage />} />
            <Route path="subjects"    element={<AdminSubjectPage />} />
            <Route path="ai-settings" element={<AISettingsPage />} />
            <Route path="settings"    element={<SystemSettingsPage />} />
          </Route>

          {/* ── Lecturer ───────────────────────────────────────── */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute role="LECTURER">
                <RoleRoute allowedRoles={[ROLES.LECTURER]}>
                  <LecturerLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index                   element={<LecturerOverviewPage />} />
            <Route path="classes"          element={<ClassManagementPage />} />
            <Route path="subjects"         element={<LecturerSubjectPage />} />
            <Route path="clos"             element={<CLOManagementPage />} />
            <Route path="lessons"          element={<LessonManagementPage />} />
            <Route path="assignments"      element={<AssignmentManagementPage />} />
            <Route path="submissions"      element={<SubmissionManagementPage />} />
            <Route path="grading/:submissionId" element={<GradingPage />} />
            <Route path="ai/exercises"     element={<AIExerciseGeneratorPage />} />
            <Route path="ai/quizzes"       element={<AIQuizGeneratorPage />} />
            <Route path="ai/feedback"      element={<AIFeedbackGeneratorPage />} />
            <Route path="ai/slides"        element={<AISlideGeneratorPage />} />
            <Route path="reports"          element={<LecturerReportPage />} />
          </Route>

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
  </ThemeProvider>
  )
}