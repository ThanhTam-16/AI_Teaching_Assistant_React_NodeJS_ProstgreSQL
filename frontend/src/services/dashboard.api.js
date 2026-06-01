import api from './api'

export const getLecturerDashboard = () => api.get('/lecturer/dashboard/overview')

// ── Student Dashboard ────────────────────────────────────────────────────────
export const getStudentDashboard        = () => api.get('/dashboard/student/overview')

