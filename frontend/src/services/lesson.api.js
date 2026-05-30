import api from './api'

export const getLessons         = (p = {})       => api.get('/lessons/lecturer', { params: p })
export const getLessonById      = (id)            => api.get(`/lessons/lecturer/${id}`)
export const createLesson       = (data)          => api.post('/lessons/lecturer', data)
export const updateLesson       = (id, data)      => api.put(`/lessons/lecturer/${id}`, data)
export const deleteLesson       = (id)            => api.delete(`/lessons/lecturer/${id}`)
export const updateLessonStatus = (id, status)    => api.patch(`/lessons/lecturer/${id}/status`, { status })
export const getLessonMaterials = (id)            => api.get(`/lessons/lecturer/${id}/materials`)
export const addLessonMaterial  = (id, data)      => api.post(`/lessons/lecturer/${id}/materials`, data)
export const deleteMaterial     = (lessonId, mid) => api.delete(`/lessons/lecturer/${lessonId}/materials/${mid}`)
