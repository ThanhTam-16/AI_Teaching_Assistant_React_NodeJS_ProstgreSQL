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
import ClassDetailPage          from './features/lecturer/pages/ClassDetailPage'
import StudentProgressDetailPage from './features/lecturer/pages/StudentProgressDetailPage'
import LecturerSubjectPage      from './features/lecturer/pages/LecturerSubjectPage'
import SubjectDetailPage        from './features/lecturer/pages/SubjectDetailPage'
import CLOManagementPage        from './features/lecturer/pages/CLOManagementPage'
import LessonManagementPage     from './features/lecturer/pages/LessonManagementPage'
import LessonDetailPage         from './features/lecturer/pages/LessonDetailPage'
import AssignmentManagementPage from './features/lecturer/pages/AssignmentManagementPage'
import AssignmentDetailPage     from './features/lecturer/pages/AssignmentDetailPage'
import { SubmissionManagementPage, GradingPage } from './features/lecturer/pages/SubmissionPages'
import {
  AIExerciseGeneratorPage,
  AIQuizGeneratorPage,
  AIFeedbackGeneratorPage,
  AISlideGeneratorPage,
  AILessonOutlineGeneratorPage,
} from './features/lecturer/pages/ai/AIPages'
import AIDraftsPage             from './features/lecturer/pages/ai/AIDraftsPage'
import AIDraftDetailPage         from './features/lecturer/pages/ai/AIDraftDetailPage'
import QuizManagementPage       from './features/lecturer/pages/QuizManagementPage'
import QuizDetailPage           from './features/lecturer/pages/QuizDetailPage'
import LecturerReportPage       from './features/lecturer/pages/LecturerReportPage'

// ── Student ───────────────────────────────────────────────────────────────────
import StudentLayout         from './features/student/layouts/StudentLayout'
import StudentOverviewPage   from './features/student/pages/StudentOverviewPage'
import MyClassesPage         from './features/student/pages/MyClassesPage'
import MySubjectsPage        from './features/student/pages/MySubjectsPage'
import LessonsPage           from './features/student/pages/LessonsPage'
import AssignmentsPage       from './features/student/pages/AssignmentsPage'
import SubmitAssignmentPage  from './features/student/pages/SubmitAssignmentPage'
import FeedbackPage          from './features/student/pages/FeedbackPage'
import ProgressPage          from './features/student/pages/ProgressPage'
import NotificationsPage     from './features/student/pages/NotificationsPage'

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
              <Route index                        element={<LecturerOverviewPage />} />
              <Route path="classes"               element={<ClassManagementPage />} />
              <Route path="classes/:classId"      element={<ClassDetailPage />} />
              <Route path="classes/:classId/subjects/:subjectId" element={<ClassDetailPage />} />
              <Route path="classes/:classId/subjects/:subjectId/students/:studentId" element={<StudentProgressDetailPage />} />
              <Route path="subjects"              element={<LecturerSubjectPage />} />
              <Route path="subjects/:subjectId"    element={<SubjectDetailPage />} />
              <Route path="clos"                  element={<CLOManagementPage />} />
              <Route path="lessons"               element={<LessonManagementPage />} />
              <Route path="lessons/:lessonId"      element={<LessonDetailPage />} />
              <Route path="assignments"           element={<AssignmentManagementPage />} />
              <Route path="assignments/:assignmentId" element={<AssignmentDetailPage />} />
              <Route path="submissions"           element={<SubmissionManagementPage />} />
              <Route path="grading/:submissionId" element={<GradingPage />} />
              <Route path="quizzes"               element={<QuizManagementPage />} />
              <Route path="quizzes/:quizId"       element={<QuizDetailPage />} />
              <Route path="ai/exercises"          element={<AIExerciseGeneratorPage />} />
              <Route path="ai/quizzes"            element={<AIQuizGeneratorPage />} />
              <Route path="ai/feedback"           element={<AIFeedbackGeneratorPage />} />
              <Route path="ai/slides"             element={<AISlideGeneratorPage />} />
              <Route path="ai/lesson-outline"     element={<AILessonOutlineGeneratorPage />} />
              <Route path="ai/history"            element={<AIDraftsPage />} />
              <Route path="ai/history/:id"        element={<AIDraftDetailPage />} />
              <Route path="reports"               element={<LecturerReportPage />} />
            </Route>

            {/* ── Student ────────────────────────────────────────── */}
            <Route
              path="/student"
              element={
                <ProtectedRoute role="STUDENT">
                  <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                    <StudentLayout />
                  </RoleRoute>
                </ProtectedRoute>
              }
            >
              <Route index                          element={<StudentOverviewPage />} />
              <Route path="classes"                 element={<MyClassesPage />} />
              <Route path="subjects"                element={<MySubjectsPage />} />
              <Route path="lessons"                 element={<LessonsPage />} />
              <Route path="assignments"             element={<AssignmentsPage />} />
              <Route path="assignments/:id/submit"  element={<SubmitAssignmentPage />} />
              <Route path="feedback"                element={<FeedbackPage />} />
              <Route path="progress"                element={<ProgressPage />} />
              <Route path="notifications"           element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}