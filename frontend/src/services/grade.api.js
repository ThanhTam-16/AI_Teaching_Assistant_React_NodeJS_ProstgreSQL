import api from './api'

export const gradeSubmission = (submissionId, data) =>
  api.post(`/submissions/lecturer/${submissionId}/grade`, data)
