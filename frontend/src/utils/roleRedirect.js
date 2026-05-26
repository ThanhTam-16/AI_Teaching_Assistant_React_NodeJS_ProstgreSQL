import { ROLE_REDIRECT } from './constants'

export const getRoleRedirectPath = (role) => {
  return ROLE_REDIRECT[role] || '/'
}