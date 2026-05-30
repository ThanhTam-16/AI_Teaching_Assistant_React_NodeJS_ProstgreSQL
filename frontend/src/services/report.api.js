import api from './api'

export const getOverviewReport    = ()    => api.get('/lecturer/reports/overview')
export const getClassReport       = (id)  => api.get(`/lecturer/reports/classes/${id}`)
export const getAssignmentReport  = (id)  => api.get(`/lecturer/reports/assignments/${id}`)
