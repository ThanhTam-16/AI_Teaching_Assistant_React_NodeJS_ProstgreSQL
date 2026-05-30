import api from './api'

export const generateExercises    = (data) => api.post('/lecturer/ai/exercises', data)
export const generateQuiz         = (data) => api.post('/lecturer/ai/quizzes', data)
export const generateFeedback     = (data) => api.post('/lecturer/ai/feedback', data)
export const generateSlideOutline = (data) => api.post('/lecturer/ai/slide-outline', data)
