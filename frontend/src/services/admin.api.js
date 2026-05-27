import api from './api'

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardOverview = () => api.get('/admin/dashboard/overview')

// ── AI Feature Management ─────────────────────────────────────────────────────
export const getAIFeatures          = ()           => api.get('/admin/ai-features')
export const toggleAIFeatureStatus  = (id, status) => api.patch(`/admin/ai-features/${id}/status`, { status })

// ── System Settings ───────────────────────────────────────────────────────────
export const getSystemSettings      = ()           => api.get('/admin/settings')
export const updateSystemSetting    = (key, value) => api.put(`/admin/settings/${key}`, { value })