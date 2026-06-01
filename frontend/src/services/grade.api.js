import api from './api'

export const gradeSubmission = (submissionId, data) =>
  api.post(`/submissions/lecturer/${submissionId}/grade`, data)

// ── Student Grades ───────────────────────────────────────────────────────────
export const getStudentGrades           = () => api.get('/grades/student')
export const getStudentGradeBySubmissionId = (submissionId) => api.get(`/grades/student/submissions/${submissionId}`)
export const getStudentGradeByAssignmentId = (assignmentId) => api.get(`/grades/student/assignments/${assignmentId}`)

