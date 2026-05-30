import api from './api'

export const getLecturerSubjects         = (p = {}) => api.get('/subjects/lecturer', { params: p })
export const getLecturerSubjectById      = (id)     => api.get(`/subjects/lecturer/${id}`)
export const getSubjectClasses           = (id)     => api.get(`/subjects/lecturer/${id}/classes`)
export const getSubjectLessons           = (id)     => api.get(`/subjects/lecturer/${id}/lessons`)
export const getSubjectAssignments       = (id)     => api.get(`/subjects/lecturer/${id}/assignments`)
