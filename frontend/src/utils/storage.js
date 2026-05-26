import { TOKEN_KEY, USER_KEY } from './constants'

export const storage = {
  getToken:   ()        => localStorage.getItem(TOKEN_KEY),
  setToken:   (token)   => localStorage.setItem(TOKEN_KEY, token),
  removeToken:()        => localStorage.removeItem(TOKEN_KEY),

  getUser:    ()        => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  },
  setUser:    (user)    => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: ()        => localStorage.removeItem(USER_KEY),

  clear:      ()        => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) },
}