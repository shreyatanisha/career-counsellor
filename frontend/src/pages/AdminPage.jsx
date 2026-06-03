import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { getAllUsers } from '../api/userApi'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import {
  Shield, Users, TrendingUp, Download, Search,
  ChevronRight, CheckCircle2, Clock, AlertTriangle, BarChart3
} from 'lucide-react'

export default function AdminPage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await getAllUsers()
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      // Mock data for demo
      setUsers([
        { id: '1', email: 'priya@example.com', full_name: 'Priya Sharma', intake_completed: true, created_at: '2026-03-20', is_admin: false },
        { id: '2', email: 'rahul@example.com', full_name: 'Rahul Mehta', intake_completed: true, created_at: '2026-03-19', is_admin: false },
        { id: '3', email: 'ananya@example.com', full_name: 'Ananya Kumar', intake_completed: false, created_at: '2026-03-21', is_admin: false },
        { id: '4', email: 'dev@test.com', full_name: 'Dev User', intake_completed: true, created_at: '2026-03-18', is_admin: true },
        { id: '5', email: 'vikram@example.com', full_name: 'Vikram Singh', intake_completed: false, created_at: '2026-03-22', is_admin: false },
      ])
    }
    setLoading(false)
  }

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const completedCount = users.filter(u => u.intake_completed).length
  const completionRate = users.length > 0 ? Math.round((completedCount / users.length) * 100) : 0

  const exportCSV = () => {
    const headers = 'Name,Email,Intake Completed,Created At,Admin\n'
    const rows = users.map(u =>
      `"${u.full_name || ''}","${u.email}",${u.intake_completed},${u.created_at},${u.is_admin}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'career_ai_users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-dark-900 pt-16 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-dark-200">You need admin privileges to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-16">
      <div className="section-container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-400" />
              Admin <span className="gradient-text">Panel</span>
            </h1>
            <p className="text-dark-200 mt-1">Manage users and view platform analytics</p>
          </div>
          <button onClick={exportCSV} className="btn-secondary inline-flex items-center gap-2 self-start">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-sm text-dark-200">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-dark-200">Completed Intake</span>
            </div>
            <p className="text-3xl font-bold text-white">{completedCount}</p>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-dark-200">Completion Rate</span>
            </div>
            <p className="text-3xl font-bold text-white">{completionRate}%</p>
            <div className="w-full h-1.5 bg-dark-500 rounded-full mt-2">
              <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field w-full !pl-11"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading users..." />
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-400/30">
                    <th className="text-left text-xs font-semibold text-dark-200 uppercase tracking-wider px-5 py-4">User</th>
                    <th className="text-left text-xs font-semibold text-dark-200 uppercase tracking-wider px-5 py-4">Email</th>
                    <th className="text-center text-xs font-semibold text-dark-200 uppercase tracking-wider px-5 py-4">Intake</th>
                    <th className="text-left text-xs font-semibold text-dark-200 uppercase tracking-wider px-5 py-4">Joined</th>
                    <th className="text-center text-xs font-semibold text-dark-200 uppercase tracking-wider px-5 py-4">Role</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr
                      key={u.id}
                      className="border-b border-dark-400/20 hover:bg-dark-600/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                          <span className="text-white font-medium text-sm">{u.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-dark-200 text-sm">{u.email}</td>
                      <td className="px-5 py-4 text-center">
                        {u.intake_completed ? (
                          <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Complete</span>
                        ) : (
                          <span className="badge bg-dark-500 text-dark-200 border border-dark-400">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-dark-200 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-center">
                        {u.is_admin ? (
                          <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30">Admin</span>
                        ) : (
                          <span className="text-dark-300 text-sm">User</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <ChevronRight className={`w-4 h-4 text-dark-400 transition-transform ${selectedUser?.id === u.id ? 'rotate-90' : ''}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-dark-300">
                  No users found matching "{search}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Detail Panel */}
        {selectedUser && (
          <div className="mt-4 glass-card p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-4">{selectedUser.full_name || selectedUser.email}</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-dark-300">Email:</span>
                <p className="text-dark-100">{selectedUser.email}</p>
              </div>
              <div>
                <span className="text-dark-300">Joined:</span>
                <p className="text-dark-100">{new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-dark-300">Intake Status:</span>
                <p className={selectedUser.intake_completed ? 'text-emerald-400' : 'text-amber-400'}>
                  {selectedUser.intake_completed ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
