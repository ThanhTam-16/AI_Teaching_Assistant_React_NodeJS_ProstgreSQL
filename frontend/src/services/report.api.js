import api from './api'

export const getOverviewReport    = ()    => api.get('/lecturer/reports/overview')
export const getClassReport       = (id)  => api.get(`/lecturer/reports/classes/${id}`)
export const getAssignmentReport  = (id)  => api.get(`/lecturer/reports/assignments/${id}`)

// ── Student Progress Reports ──────────────────────────────────────────────────
export const getStudentProgress         = () => api.get('/reports/student/progress')
export const getStudentSubjectProgress  = (subjectId) => api.get(`/reports/student/subjects/${subjectId}/progress`)
export const getStudentClassProgress    = (classId) => api.get(`/reports/student/classes/${classId}/progress`)

