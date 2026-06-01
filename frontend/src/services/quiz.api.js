import api from './api'

// ── Quizzes ───────────────────────────────────────────────────────────────────
export const getStudentQuizzes          = (p = {}) => api.get('/quizzes/student', { params: p })
export const getStudentQuizById         = (id)     => api.get(`/quizzes/student/${id}`)
