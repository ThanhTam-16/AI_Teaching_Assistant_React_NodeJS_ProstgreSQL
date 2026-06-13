import api from './api'

// ── Notifications ─────────────────────────────────────────────────────────────
export const getStudentNotifications    = (p = {}) => api.get('/notifications/student', { params: p })
export const markNotificationRead       = (id)     => api.patch(`/notifications/student/${id}/read`)
export const markAllNotificationsRead   = ()       => api.patch('/notifications/student/read-all')

export const getLecturerNotifications    = (p = {}) => api.get('/notifications/lecturer', { params: p })
export const markLecturerNotificationRead = (id)     => api.patch(`/notifications/lecturer/${id}/read`)
export const markAllLecturerNotificationsRead = ()   => api.patch('/notifications/lecturer/read-all')
