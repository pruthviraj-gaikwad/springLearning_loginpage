import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from './ThemeToggle'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className="navbar">
      <Link to={isAuthenticated ? '/profile' : '/login'} className="brand">
        <span className="brand-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <span>Login Page Project</span>
      </Link>

      <div className="nav-right">
        <ThemeToggle />
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            <span className="nav-user">
              <span className="avatar" aria-hidden="true">
                {initial}
              </span>
              <span className="greeting">Hello, {user?.name}</span>
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
