import api from './api'

export const getUsers          = (params = {}) => api.get('/users', { params })
export const getUserById       = (id)          => api.get(`/users/${id}`)
export const createUser        = (data)        => api.post('/users', data)
export const updateUser        = (id, data)    => api.put(`/users/${id}`, data)
export const deleteUser        = (id)          => api.delete(`/users/${id}`)
export const toggleUserStatus  = (id, status)  => api.patch(`/users/${id}/status`, { status })