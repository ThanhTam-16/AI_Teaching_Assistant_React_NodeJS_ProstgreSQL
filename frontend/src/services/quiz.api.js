import api from './api'

// ── Quizzes (Student) ──────────────────────────────────────────────────────────
export const getStudentQuizzes          = (p = {}) => api.get('/quizzes/student', { params: p })
export const getStudentQuizById         = (id)     => api.get(`/quizzes/student/${id}`)

// ── Quizzes (Lecturer) ─────────────────────────────────────────────────────────
export const getQuizzes         = (p = {}) => api.get('/quizzes/lecturer', { params: p })
export const getQuizById        = (id)     => api.get(`/quizzes/lecturer/${id}`)
export const createQuiz         = (data)   => api.post('/quizzes/lecturer', data)
export const updateQuiz         = (id, d)  => api.put(`/quizzes/lecturer/${id}`, d)
export const deleteQuiz         = (id)     => api.delete(`/quizzes/lecturer/${id}`)
export const addQuizQuestion    = (id, d)  => api.post(`/quizzes/lecturer/${id}/questions`, d)
export const updateQuizQuestion = (qId, d) => api.put(`/quizzes/questions/lecturer/${qId}`, d)
export const deleteQuizQuestion = (qId)    => api.delete(`/quizzes/questions/lecturer/${qId}`)

