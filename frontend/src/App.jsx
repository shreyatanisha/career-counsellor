import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore } from './store/userStore'
import LandingPage from './pages/LandingPage'
import IntakePage from './pages/IntakePage'
import ResultsPage from './pages/ResultsPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/shared/Navbar'
import ErrorBoundary from './components/shared/ErrorBoundary'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useUserStore()
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const { user } = useUserStore()
  return user?.is_admin ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/intake" element={<ProtectedRoute><IntakePage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
