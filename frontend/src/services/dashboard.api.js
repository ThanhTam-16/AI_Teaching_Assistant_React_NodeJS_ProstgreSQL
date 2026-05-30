import api from './api'

export const getLecturerDashboard = () => api.get('/lecturer/dashboard/overview')
