'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Calendar, MapPin, AlertCircle, BarChart3, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DashboardLoadingScreen } from '@/components/dashboard/loading-screen'
import { StatCard } from '@/components/dashboard/stat-card'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

type Incident = {
  id: string
  location: string
  description: string
  status: string
  severity: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

type UserStats = {
  totalReports: number
  recentReports: number
  resolvedCount: number
  activeCount: number
  byStatus: { status: string; count: number }[]
  bySeverity: { severity: string; count: number }[]
  monthlyChart: { month: string; count: number }[]
  avgResolutionHours: number
}

const statusConfig: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: 'Received', color: 'bg-blue-100 text-blue-800' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-yellow-100 text-yellow-800' },
  ON_WAY: { label: 'On the Way', color: 'bg-orange-100 text-orange-800' },
  ARRIVED: { label: 'Arrived', color: 'bg-purple-100 text-purple-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  FALSE_ALARM: { label: 'False Alarm', color: 'bg-gray-100 text-gray-800' },
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

export default function MyReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showStats, setShowStats] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchMyReports = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('userId', session?.user?.id || '')

      const response = await fetch(`/api/incidents/my-reports?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setIncidents(data)
      } else {
        toast.error('Failed to load your reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load your reports')
    } finally {
      setLoading(false)
    }
  }, [session, statusFilter])

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/user')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Initial load - only run once when session is available
  useEffect(() => {
    if (session) {
      fetchMyReports()
      fetchUserStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  // Refresh stats periodically (every 30 seconds) to catch status updates
  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      fetchUserStats()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const filteredIncidents = incidents.filter((incident) =>
    incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  if (status === 'loading' || loading) {
    return <DashboardLoadingScreen />
  }

  return (
    <DashboardShell
      variant="user"
      email={session?.user?.email}
      role={session?.user?.role}
      title="My Reports"
      subtitle="Track your submitted incidents and personal statistics"
      showAdminLink={isAdmin}
      headerActions={
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm md:hidden"
          aria-label="Toggle statistics"
        >
          <BarChart3 className="h-5 w-5" />
        </button>
      }
    >
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Reported Incidents</h1>
          <p className="text-sm md:text-base text-gray-600">Track the status of all your fire incident reports</p>
        </div>

        {/* Statistics Section Header */}
        {!statsLoading && (
          <div className="mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">📊 Your Statistics</h2>
            <p className="text-sm md:text-base text-gray-600">Personal analytics and insights</p>
          </div>
        )}

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-4 md:mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading your statistics...</span>
            </div>
          </div>
        ) : stats ? (
          <div className="mb-4 grid grid-cols-2 gap-4 md:mb-6 md:grid-cols-4">
            <StatCard label="Total reports" value={stats.totalReports ?? 0} icon={FileText} accent="red" />
            <StatCard label="Active" value={stats.activeCount ?? 0} icon={AlertCircle} accent="orange" delay={0.05} />
            <StatCard label="Resolved" value={stats.resolvedCount ?? 0} icon={CheckCircle2} accent="green" delay={0.1} />
            <StatCard label="Recent (7d)" value={stats.recentReports ?? 0} icon={TrendingUp} accent="blue" delay={0.15} />
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
            <p className="text-sm md:text-base text-blue-800">
              📊 <strong>No statistics yet.</strong> Submit your first report to see your personal analytics!
            </p>
          </div>
        )}

        {/* Charts Section - Hidden on Mobile by Default */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.monthlyChart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-bold mb-4">Reports Over Time</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
            {stats.bySeverity && stats.bySeverity.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200"
              >
                <h2 className="text-lg md:text-xl font-bold mb-4">🎯 Reports by Severity</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.bySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, count }) => `${severity}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.bySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>
        )}

        {/* Additional Stats */}
        {!statsLoading && stats && (stats.avgResolutionHours > 0 || (stats.byStatus && stats.byStatus.length > 0)) && (
          <>
            <div className="mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">📋 Detailed Metrics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              {stats.avgResolutionHours > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-blue-200"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                    <div>
                      <p className="text-sm md:text-base text-blue-700 font-medium">Average Resolution Time</p>
                      <p className="text-2xl md:text-3xl font-bold text-blue-900">{stats.avgResolutionHours.toFixed(1)} hours</p>
                    </div>
                  </div>
                </motion.div>
              )}
              {stats.byStatus && stats.byStatus.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200"
                >
                  <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-900">📊 Status Breakdown</h3>
                  <div className="space-y-2">
                    {stats.byStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-xs md:text-sm text-gray-700 font-medium">{item.status.replace('_', ' ')}</span>
                        <span className="text-sm md:text-base font-bold text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* Filters - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, description, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="ON_WAY">On the Way</option>
              <option value="ARRIVED">Arrived</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_ALARM">False Alarm</option>
            </select>
          </div>
        </div>

        {/* Reports List - Mobile Optimized */}
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">You haven't reported any fire incidents yet.</p>
            <Link
              href="/report"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
            >
              Report Your First Incident
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {filteredIncidents.map((incident) => {
              const status = statusConfig[incident.status] || statusConfig.RECEIVED
              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">{incident.location}</h3>
                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3 line-clamp-2">{incident.description}</p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Reported: {formatDate(incident.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                          <span className={`px-2 py-1 rounded text-xs ${
                            incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                            incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        {incident.resolvedAt && (
                          <div className="flex items-center space-x-1">
                            <span>Resolved: {formatDate(incident.resolvedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex md:flex-col items-end md:items-end justify-between md:justify-start space-x-2 md:space-x-0 md:space-y-2">
                      <Link
                        href={`/dashboard/incidents/${incident.id}`}
                        className="px-3 md:px-4 py-2 text-xs md:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      <span className="text-xs text-gray-500 font-mono">ID: {incident.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
    </DashboardShell>
  )
}
