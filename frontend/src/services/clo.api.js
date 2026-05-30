import api from './api'

export const getCLOs      = (p = {})      => api.get('/clos/lecturer', { params: p })
export const getCLOById   = (id)          => api.get(`/clos/lecturer/${id}`)
export const createCLO    = (data)        => api.post('/clos/lecturer', data)
export const updateCLO    = (id, data)    => api.put(`/clos/lecturer/${id}`, data)
export const deleteCLO    = (id)          => api.delete(`/clos/lecturer/${id}`)
