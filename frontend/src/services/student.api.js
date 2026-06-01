import api from './api'

// ── Student Dashboard / Overview ─────────────────────────────────────────────
export const getStudentDashboard        = () => api.get('/dashboard/student/overview')