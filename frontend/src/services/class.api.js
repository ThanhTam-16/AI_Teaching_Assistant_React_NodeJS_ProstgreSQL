import api from './api'

export const getLecturerClasses      = (p = {})    => api.get('/classes/lecturer', { params: p })
export const getLecturerClassById    = (id)         => api.get(`/classes/lecturer/${id}`)
export const createClass             = (data)       => api.post('/classes/lecturer', data)
export const updateClass             = (id, data)   => api.put(`/classes/lecturer/${id}`, data)
export const updateClassStatus       = (id, status) => api.patch(`/classes/lecturer/${id}/status`, { status })
export const getStudentsInClass      = (id)         => api.get(`/classes/lecturer/${id}/students`)
export const addStudentToClass       = (id, data)   => api.post(`/classes/lecturer/${id}/students`, data)
export const removeStudentFromClass  = (classId, studentId) => api.delete(`/classes/lecturer/${classId}/students/${studentId}`)

// ── Student Classes ──────────────────────────────────────────────────────────
export const getStudentClasses          = (p = {}) => api.get('/classes/student', { params: p })
export const getStudentClassById        = (id)     => api.get(`/classes/student/${id}`)

