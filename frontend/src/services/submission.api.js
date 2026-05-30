import api from './api'

export const getSubmissions      = (p = {}) => api.get('/submissions/lecturer', { params: p })
export const getSubmissionById   = (id)     => api.get(`/submissions/lecturer/${id}`)
