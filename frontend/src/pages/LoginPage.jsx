import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { loginUser } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import Alert from '../components/Alert'
import FormField from '../components/FormField'

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const registered = location.state?.registered
  const sessionExpired = location.state?.sessionExpired
  const from = location.state?.from?.pathname || '/profile'

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: undefined })
  }

  function validate() {
    const newErrors = {}
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!form.password) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      const data = await loginUser(form)
      login(data.accessToken, data.user)
      navigate(from, { replace: true })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <form className="card" onSubmit={handleSubmit} noValidate>
        <h2 className="card-title">Login</h2>
        <p className="card-subtitle">Welcome back. Please enter your details.</p>

        {registered && <Alert type="success">Registration successful. Please log in.</Alert>}
        {sessionExpired && <Alert type="warning">Your session has expired. Please log in again.</Alert>}
        {serverError && <Alert type="error">{serverError}</Alert>}

        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Your password"
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="card-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </main>
  )
}

export default LoginPage
