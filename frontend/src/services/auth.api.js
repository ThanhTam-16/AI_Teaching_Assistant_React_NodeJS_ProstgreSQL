import api from './api'

// POST /auth/login  — body: { email, password }
// response: { success, message, data: { token, user } }
export const loginApi = (credentials) => api.post('/auth/login', credentials)

// GET /auth/me — requires Bearer token
export const getMeApi = () => api.get('/auth/me')

// POST /auth/logout — requires Bearer token
export const logoutApi = () => api.post('/auth/logout')