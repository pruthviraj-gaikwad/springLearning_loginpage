import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { getProfile } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import Alert from '../components/Alert'

function ProfilePage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile(token)
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err.status === 401) {
          // The token is invalid or expired: forget it and ask the user to log in again
          logout()
          navigate('/login', { replace: true, state: { sessionExpired: true } })
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [token, logout, navigate])

  if (loading) {
    return (
      <main className="page">
        <div className="card profile" aria-busy="true" aria-label="Loading profile">
          <div className="skeleton skeleton-circle" />
          <div className="skeleton skeleton-line" style={{ width: '55%' }} />
          <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton skeleton-line" style={{ width: '100%', height: '6rem', marginTop: '1.5rem' }} />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page">
        <div className="card">
          <Alert type="error">{error}</Alert>
          <Link to="/login">Back to login</Link>
        </div>
      </main>
    )
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="page">
      <section className="card profile">
        <div className="avatar avatar-lg" aria-hidden="true">
          {profile.name.trim()[0]?.toUpperCase()}
        </div>
        <h2 className="card-title">{profile.name}</h2>
        <p className="profile-email">{profile.email}</p>

        <dl className="details">
          <div className="details-row">
            <dt>Name</dt>
            <dd>{profile.name}</dd>
          </div>
          <div className="details-row">
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="details-row">
            <dt>Member since</dt>
            <dd>{memberSince}</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}

export default ProfilePage
