import api from './api'

export const getSubmissions      = (p = {}) => api.get('/submissions/lecturer', { params: p })
export const getSubmissionById   = (id)     => api.get(`/submissions/lecturer/${id}`)

// ── Student Submissions ──────────────────────────────────────────────────────
export const getStudentSubmissions      = (p = {}) => api.get('/submissions/student', { params: p })
export const getStudentSubmissionById   = (id)     => api.get(`/submissions/student/${id}`)
export const submitAssignment           = (assignmentId, data) =>
  api.post(`/submissions/student/assignments/${assignmentId}`, data)
export const updateSubmission           = (submissionId, data) =>
  api.put(`/submissions/student/${submissionId}`, data)

