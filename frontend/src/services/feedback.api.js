import api from './api'

export const getSubmissionFeedbacks = (id)  => api.get(`/submissions/lecturer/${id}/feedbacks`)
export const createFeedback      = (id, d)  => api.post(`/submissions/lecturer/${id}/feedbacks`, d)
