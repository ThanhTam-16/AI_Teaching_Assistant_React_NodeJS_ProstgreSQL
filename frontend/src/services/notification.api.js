import api from './api'

// ── Notifications ─────────────────────────────────────────────────────────────
export const getStudentNotifications    = (p = {}) => api.get('/notifications/student', { params: p })
export const markNotificationRead       = (id)     => api.patch(`/notifications/student/${id}/read`)
export const markAllNotificationsRead   = ()       => api.patch('/notifications/student/read-all')
