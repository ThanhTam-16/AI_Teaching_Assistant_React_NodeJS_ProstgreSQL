export const ROLES = {
  ADMIN:    'ADMIN',
  LECTURER: 'LECTURER',
  STUDENT:  'STUDENT',
}

export const ROLE_REDIRECT = {
  ADMIN:    '/admin',
  LECTURER: '/lecturer',
  STUDENT:  '/student',
}

export const TOKEN_KEY   = 'aita_token'
export const USER_KEY    = 'aita_user'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'