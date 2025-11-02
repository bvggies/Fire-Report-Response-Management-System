'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, LogOut, Search, Filter, FileText, Calendar, MapPin, AlertCircle, BarChart3, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { signOut } from 'next-auth/react'
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

  useEffect(() => {
    if (session) {
      fetchMyReports()
      fetchUserStats()
    }
  }, [session, statusFilter])

  const fetchMyReports = async () => {
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
  }

  const fetchUserStats = async () => {
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
  }

  const filteredIncidents = incidents.filter((incident) =>
    incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Mobile Optimized */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                <span className="text-xl md:text-2xl font-bold text-gray-900">FireResponse</span>
                <span className="hidden md:inline px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  My Reports
                </span>
              </div>
              <button
                onClick={() => setShowStats(!showStats)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base">
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="px-3 md:px-4 py-2 text-gray-700 hover:text-red-600 transition-colors text-sm"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/report"
                className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
              >
                Report Incident
              </Link>
              <span className="hidden md:inline text-gray-700 text-sm md:text-base">{session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 text-gray-700 hover:text-red-600 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Reported Incidents</h1>
          <p className="text-sm md:text-base text-gray-600">Track the status of all your fire incident reports</p>
        </div>

        {/* Statistics Cards - Show/Hide on Mobile */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-4 md:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.totalReports}</p>
                </div>
                <FileText className="w-8 h-8 md:w-12 md:h-12 text-red-600 opacity-20" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-4 md:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Active</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.activeCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-orange-600 opacity-20" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-4 md:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.resolvedCount}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-green-600 opacity-20" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 md:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Recent (7d)</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.recentReports}</p>
                </div>
                <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-blue-600 opacity-20" />
              </div>
            </motion.div>
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
            {stats.bySeverity.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-bold mb-4">Reports by Severity</h2>
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
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {stats.avgResolutionHours > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                  <div>
                    <p className="text-sm md:text-base text-gray-600">Average Resolution Time</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.avgResolutionHours.toFixed(1)} hours</p>
                  </div>
                </div>
              </motion.div>
            )}
            {stats.byStatus.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <h3 className="text-sm md:text-base font-semibold mb-3">Status Breakdown</h3>
                <div className="space-y-2">
                  {stats.byStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-600">{item.status.replace('_', ' ')}</span>
                      <span className="text-sm md:text-base font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
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
      </div>
    </div>
  )
}
