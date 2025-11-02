'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, ArrowLeft, BarChart3, TrendingUp, AlertTriangle, Users, Clock, CheckCircle2, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { motion } from 'framer-motion'

type Stats = {
  total: number
  byStatus: { status: string; count: number }[]
  bySeverity: { severity: string; count: number }[]
  recent: number
}

type AdminStats = {
  totalIncidents: number
  totalUsers: number
  totalPersonnel: number
  totalStations: number
  recentIncidents: number
  recentUsers: number
  byStatus: { status: string; count: number }[]
  bySeverity: { severity: string; count: number }[]
  byRole: { role: string; count: number }[]
  monthlyChart: { month: string; total: number; resolved: number }[]
  topReporters: { reporterId: string; name: string; email: string; count: number }[]
  resolutionRate: number
  avgResolutionHours: number
  activeCount: number
  resolvedCount: number
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAdminStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/admin')
      if (response.ok) {
        const data = await response.json()
        setAdminStats(data)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      const admin = session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN'
      setIsAdmin(admin)
      
      if (admin) {
        fetchAdminStats()
      } else {
        fetchStats()
      }
    }
  }, [session, fetchStats, fetchAdminStats])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Mobile Optimized */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden md:inline">Back to Dashboard</span>
                </button>
                <div className="hidden md:flex items-center space-x-2">
                  <Flame className="w-8 h-8 text-red-600" />
                  <span className="text-2xl font-bold text-gray-900">FireResponse</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
          <span>Analytics Dashboard</span>
        </h1>

        {/* Admin Analytics */}
        {isAdmin && adminStats && (
          <>
            {/* Stats Cards - Mobile Responsive */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 mb-4 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total Incidents</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{adminStats.totalIncidents}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-red-600 opacity-20" />
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
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{adminStats.activeCount}</p>
                  </div>
                  <Activity className="w-8 h-8 md:w-12 md:h-12 text-orange-600 opacity-20" />
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
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{adminStats.resolvedCount}</p>
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
                    <p className="text-xs md:text-sm text-gray-600">Total Users</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{adminStats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 md:w-12 md:h-12 text-blue-600 opacity-20" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Resolution Rate</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{adminStats.resolutionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-green-600 opacity-20" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Recent (24h)</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{adminStats.recentIncidents}</p>
                  </div>
                  <Clock className="w-8 h-8 md:w-12 md:h-12 text-purple-600 opacity-20" />
                </div>
              </motion.div>
            </div>

            {/* Charts - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
              {adminStats.monthlyChart.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 md:p-6"
                >
                  <h2 className="text-lg md:text-xl font-bold mb-4">Incidents Trend (6 Months)</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={adminStats.monthlyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} name="Total" />
                      <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved" />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
              {adminStats.bySeverity.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 md:p-6"
                >
                  <h2 className="text-lg md:text-xl font-bold mb-4">Incidents by Severity</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={adminStats.bySeverity}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ severity, count }) => `${severity}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {adminStats.bySeverity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            {/* Additional Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-8">
              {adminStats.byStatus.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 md:p-6"
                >
                  <h2 className="text-lg md:text-xl font-bold mb-4">Incidents by Status</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={adminStats.byStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" fontSize={10} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
              {adminStats.avgResolutionHours > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 md:p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                    <div>
                      <p className="text-sm md:text-base text-gray-600">Average Resolution Time</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">{adminStats.avgResolutionHours.toFixed(1)} hours</p>
                    </div>
                  </div>
                </motion.div>
              )}
              {adminStats.topReporters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-4 md:p-6"
                >
                  <h3 className="text-base md:text-lg font-semibold mb-3">Top Reporters</h3>
                  <div className="space-y-2">
                    {adminStats.topReporters.slice(0, 5).map((reporter) => (
                      <div key={reporter.reporterId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{reporter.name}</p>
                          <p className="text-xs text-gray-500 truncate">{reporter.email}</p>
                        </div>
                        <span className="text-sm md:text-base font-semibold text-red-600 ml-2">{reporter.count}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Role Distribution */}
            {adminStats.byRole.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-8"
              >
                <h2 className="text-lg md:text-xl font-bold mb-4">Users by Role</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={adminStats.byRole}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </>
        )}

        {/* Regular User Analytics */}
        {!isAdmin && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total Incidents</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.total}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-red-600 opacity-20" />
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
                    <p className="text-xs md:text-sm text-gray-600">Recent (24h)</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{stats.recent}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-green-600 opacity-20" />
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
                    <p className="text-xs md:text-sm text-gray-600">Active</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">
                      {stats.byStatus.filter(s => s.status !== 'RESOLVED' && s.status !== 'FALSE_ALARM').reduce((acc, s) => acc + s.count, 0)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 md:w-12 md:h-12 text-blue-600 opacity-20" />
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
                    <p className="text-xs md:text-sm text-gray-600">Resolved</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">
                      {stats.byStatus.find(s => s.status === 'RESOLVED')?.count || 0}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-green-600 opacity-20" />
                </div>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-bold mb-4">Incidents by Status</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-bold mb-4">Incidents by Severity</h2>
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
