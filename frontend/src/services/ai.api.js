import api from './api'

export const generateExercises          = (data) => api.post('/lecturer/ai/exercises', data)
export const generateQuiz               = (data) => api.post('/lecturer/ai/quizzes', data)
export const generateFeedback           = (data) => api.post('/lecturer/ai/feedback', data)
export const generateLessonOutline      = (data) => api.post('/lecturer/ai/lesson-outline', data)
export const generateSlideOutline       = (data) => api.post('/lecturer/ai/slide-outline', data)

export const getAIHistory               = (params) => api.get('/lecturer/ai/history', { params })
export const getAIHistoryById           = (id) => api.get(`/lecturer/ai/history/${id}`)
export const deleteAIHistory           = (id) => api.delete(`/lecturer/ai/history/${id}`)

export const saveAIExerciseAsAssignment = (data) => api.post('/lecturer/ai/exercises/save-assignment', data)
export const saveAIQuiz                 = (data) => api.post('/lecturer/ai/quizzes/save', data)
export const saveAILessonOutline        = (data) => api.post('/lecturer/ai/lesson-outline/save', data)
