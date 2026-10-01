import { Link, Navigate, Route, Routes } from 'react-router'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'

function NotFound() {
  return (
    <main className="page">
      <div className="card not-found">
        <div className="big">404</div>
        <h2 className="card-title">Page not found</h2>
        <p className="card-subtitle">The page you are looking for does not exist.</p>
        <Link to="/login" className="btn btn-primary">
          Back to login
        </Link>
      </div>
    </main>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
