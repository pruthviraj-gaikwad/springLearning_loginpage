const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// Used only when the server's answer has no JSON message (for example an error from a proxy)
function defaultMessage(status) {
  if (status === 401) return 'Your session is invalid or has expired. Please log in again.'
  if (status === 403) return 'You do not have permission to do this.'
  if (status === 404) return 'The requested resource was not found.'
  if (status >= 500) return 'The server had a problem. Please try again later.'
  return 'Something went wrong. Please try again.'
}

async function request(path, options = {}) {
  const { headers, ...rest } = options

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...headers },
    })
  } catch {
    // fetch itself failed: server down, network problem
    throw new ApiError(0, 'Cannot reach the server. Please try again later.')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || defaultMessage(response.status),
      data?.fieldErrors || {}
    )
  }

  return data
}

export function getHello() {
  return request('/api/hello')
}

export function registerUser({ name, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function loginUser({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getProfile(token) {
  return request('/api/user/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
