import api from './api'

export const getSubmissionFeedbacks = (id)  => api.get(`/submissions/lecturer/${id}/feedbacks`)
export const createFeedback      = (id, d)  => api.post(`/submissions/lecturer/${id}/feedbacks`, d)

// ── Student Feedbacks ────────────────────────────────────────────────────────
export const getStudentFeedbacks        = (p = {}) => api.get('/feedbacks/student', { params: p })
export const getStudentFeedbackBySubmission = (submissionId) =>
  api.get(`/feedbacks/student/submissions/${submissionId}`)
export const getStudentFeedbackByAssignment = (assignmentId) =>
  api.get(`/feedbacks/student/assignments/${assignmentId}`)

