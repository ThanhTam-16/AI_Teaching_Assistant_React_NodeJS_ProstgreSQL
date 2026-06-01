import api from './api'

export const getAssignments         = (p = {})       => api.get('/assignments/lecturer', { params: p })
export const getAssignmentById      = (id)            => api.get(`/assignments/lecturer/${id}`)
export const createAssignment       = (data)          => api.post('/assignments/lecturer', data)
export const updateAssignment       = (id, data)      => api.put(`/assignments/lecturer/${id}`, data)
export const deleteAssignment       = (id)            => api.delete(`/assignments/lecturer/${id}`)
export const updateAssignmentStatus = (id, status)    => api.patch(`/assignments/lecturer/${id}/status`, { status })
export const getAssignmentSubmissions = (id, p = {}) => api.get(`/assignments/lecturer/${id}/submissions`, { params: p })

// ── Student Assignments ──────────────────────────────────────────────────────
export const getStudentAssignments      = (p = {}) => api.get('/assignments/student', { params: p })
export const getStudentAssignmentById   = (id)     => api.get(`/assignments/student/${id}`)
export const getStudentAssignmentMySubmission = (id) => api.get(`/assignments/student/${id}/my-submission`)

