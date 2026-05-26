import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'
import { storage } from '../utils/storage'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — clear storage & redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      storage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api