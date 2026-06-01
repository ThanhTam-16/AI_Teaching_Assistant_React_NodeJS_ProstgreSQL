import api from './api'

export const getLecturerSubjects         = (p = {}) => api.get('/subjects/lecturer', { params: p })
export const getLecturerSubjectById      = (id)     => api.get(`/subjects/lecturer/${id}`)
export const getSubjectClasses           = (id)     => api.get(`/subjects/lecturer/${id}/classes`)
export const getSubjectLessons           = (id)     => api.get(`/subjects/lecturer/${id}/lessons`)
export const getSubjectAssignments       = (id)     => api.get(`/subjects/lecturer/${id}/assignments`)

// ── Student Subjects ──────────────────────────────────────────────────────────
export const getStudentSubjects         = (p = {}) => api.get('/subjects/student', { params: p })
export const getStudentSubjectById      = (id)     => api.get(`/subjects/student/${id}`)
export const getStudentSubjectClos      = (id)     => api.get(`/subjects/student/${id}/clos`)
export const getStudentSubjectLessons   = (id)     => api.get(`/subjects/student/${id}/lessons`)
export const getStudentSubjectAssignments = (id)   => api.get(`/subjects/student/${id}/assignments`)

