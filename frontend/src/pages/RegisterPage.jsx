import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { registerUser } from '../services/api'
import Alert from '../components/Alert'
import FormField from '../components/FormField'

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']

// A friendly hint only. The real rules are enforced by the backend.
function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++
  return score
}

function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const strength = passwordStrength(form.password)

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrors({ ...errors, [name]: undefined })
  }

  function validate() {
    const newErrors = {}
    if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
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
      await registerUser(form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors)
      } else {
        setServerError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <form className="card" onSubmit={handleSubmit} noValidate>
        <h2 className="card-title">Create your account</h2>
        <p className="card-subtitle">It only takes a minute.</p>

        {serverError && <Alert type="error">{serverError}</Alert>}

        <FormField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
          placeholder="Your full name"
          autoFocus
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          hint="At least 8 characters. Mix letters, numbers and symbols for a stronger password."
          autoComplete="new-password"
          placeholder="Choose a password"
        >
          {form.password && (
            <div className={`strength strength-${strength}`} aria-live="polite">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={n <= strength ? 'strength-bar on' : 'strength-bar'} />
                ))}
              </div>
              <span className="strength-label">{STRENGTH_LABELS[strength]}</span>
            </div>
          )}
        </FormField>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading && <span className="spinner" aria-hidden="true" />}
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="card-footer">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  )
}

export default RegisterPage
