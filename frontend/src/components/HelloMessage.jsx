import { useEffect, useState } from 'react'
import { getHello } from '../services/api'

function HelloMessage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHello()
      .then(data => setMessage(data.message))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>
  }

  return <p>Backend says: {message}</p>
}

export default HelloMessage
