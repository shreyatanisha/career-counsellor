import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'
import { useAuth } from '../../hooks/useAuth'
import { Sparkles, Menu, X, LogOut, User, LayoutDashboard, Shield } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated } = useUserStore()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-400/30">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Career<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/intake" className="text-dark-100 hover:text-white transition-colors text-sm font-medium">
                  Assessment
                </Link>
                <Link to="/results" className="text-dark-100 hover:text-white transition-colors text-sm font-medium">
                  Results
                </Link>
                <Link to="/dashboard" className="text-dark-100 hover:text-white transition-colors text-sm font-medium">
                  Dashboard
                </Link>
                {user?.is_admin && (
                  <Link to="/admin" className="text-dark-100 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
                <div className="h-5 w-px bg-dark-400" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-dark-100">{user?.full_name || user?.email}</span>
                  </div>
                  <button onClick={handleLogout} className="text-dark-200 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-dark-600">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/" className="btn-primary text-sm !px-4 !py-2">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-dark-100 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-400/30 animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link to="/intake" onClick={() => setMobileOpen(false)} className="block text-dark-100 hover:text-white py-2 text-sm">Assessment</Link>
                <Link to="/results" onClick={() => setMobileOpen(false)} className="block text-dark-100 hover:text-white py-2 text-sm">Results</Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-dark-100 hover:text-white py-2 text-sm">Dashboard</Link>
                {user?.is_admin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-dark-100 hover:text-white py-2 text-sm">Admin</Link>
                )}
                <button onClick={handleLogout} className="block text-red-400 hover:text-red-300 py-2 text-sm w-full text-left">Sign Out</button>
              </>
            ) : (
              <Link to="/" className="btn-primary block text-center text-sm">Get Started</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
