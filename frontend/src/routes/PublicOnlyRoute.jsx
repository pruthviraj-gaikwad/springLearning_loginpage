import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

// The opposite of ProtectedRoute: pages such as /login and /register make no sense
// for someone who is already logged in, so send them to their profile instead.
function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
