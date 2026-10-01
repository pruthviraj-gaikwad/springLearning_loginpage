import { useCallback, useState } from 'react'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)

  // useCallback keeps the same function between renders, so components can safely
  // list login/logout in a useEffect dependency array without re-running the effect.
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
