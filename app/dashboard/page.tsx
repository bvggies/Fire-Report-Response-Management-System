'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, LogOut, Map, Filter, Search, AlertCircle, CheckCircle, BarChart3, TrendingUp, Users, Building2, Clock, Volume2, VolumeX, MapPin, ExternalLink } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

type Incident = {
  id: string
  location: string
  description: string
  status: string
  severity: string
  createdAt: string
  latitude?: number
  longitude?: number
  reporter?: {
    name?: string
    email?: string
  }
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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastIncidentIds, setLastIncidentIds] = useState<Set<string>>(new Set())
  const [isBeeping, setIsBeeping] = useState(false)
  const [beepEnabled, setBeepEnabled] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Play alarm sound
  const playAlarm = useCallback(() => {
    if (!beepEnabled) return
    
    // Allow playing even if currently beeping (for multiple incidents)
    try {
      setIsBeeping(true)
      // Play the alarm sound file
      const audio = new Audio('/alarm.wav')
      audio.volume = 0.8
      
      // Preload and play the alarm sound
      audio.load()
      const playPromise = audio.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Alarm sound playing')
          })
          .catch((error) => {
            console.error('Error playing alarm:', error)
            // Try to play again after user interaction
            setIsBeeping(false)
          })
      }

      // Reset beeping state after audio finishes
      audio.onended = () => {
        setIsBeeping(false)
      }
      
      // Also reset after 5 seconds as fallback (alarm.wav might be longer)
      setTimeout(() => {
        setIsBeeping(false)
      }, 5000)
    } catch (error) {
      console.error('Error playing alarm:', error)
      setIsBeeping(false)
    }
  }, [beepEnabled])

  const fetchIncidents = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (severityFilter) params.append('severity', severityFilter)

      const response = await fetch(`/api/incidents?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        
        // Check for new incidents (only if we're monitoring and not filtering)
        const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'
        if (isAdmin && beepEnabled && !statusFilter && !severityFilter) {
          // Track incidents by ID for better detection
          const currentIncidentIds = new Set<string>(data.map((inc: Incident) => inc.id))
          
          // Use functional update to avoid dependency issues
          setLastIncidentIds(prev => {
            if (prev.size > 0) {
              // Find new incidents (IDs that weren't in the last set)
              const newIncidentIds = Array.from<string>(currentIncidentIds).filter(
                (id) => !prev.has(id)
              )
              
              if (newIncidentIds.length > 0) {
                // New incident(s) detected!
                // Call playAlarm immediately (outside of setState to ensure it executes)
                setTimeout(() => {
                  playAlarm()
                }, 0)
                toast.success(`🚨 ${newIncidentIds.length} new incident${newIncidentIds.length > 1 ? 's' : ''} reported!`, {
                  duration: 5000,
                  icon: '🚨',
                })
              }
            }
            return currentIncidentIds
          })
        } else if (isAdmin && data.length > 0) {
          // Initialize the set on first load (only if empty)
          setLastIncidentIds(prev => {
            if (prev.size === 0) {
              return new Set<string>(data.map((inc: Incident) => inc.id))
            }
            return prev
          })
        }
        
        setIncidents(data)
      }
    } catch (error) {
      console.error('Error fetching incidents:', error)
      toast.error('Failed to load incidents')
    } finally {
      setLoading(false)
    }
    // Only include stable dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, severityFilter, beepEnabled, session?.user?.role, playAlarm])

  const fetchAdminStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/analytics/admin')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error fetching admin stats:', errorData)
        toast.error('Failed to load statistics')
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Initial load - only run once when session is available
  useEffect(() => {
    if (session) {
      fetchIncidents()
      if (session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN') {
        fetchAdminStats()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  // Refetch incidents when filters change
  useEffect(() => {
    if (session) {
      setLoading(true)
      fetchIncidents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, severityFilter, session?.user?.id])

  // Poll for new incidents and refresh analytics (only for admins)
  useEffect(() => {
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'
    
    if (!isAdmin || !session) return

    // Initial setup after first load - wait for incidents to be loaded (only once)
    if (incidents.length > 0 && lastIncidentIds.size === 0) {
      setLastIncidentIds(new Set<string>(incidents.map(inc => inc.id)))
    }

    // Poll every 2 seconds for new incidents (more frequent for immediate detection)
    const incidentInterval = setInterval(() => {
      // Only fetch if no filters are active
      if (!statusFilter && !severityFilter) {
        fetchIncidents()
      }
    }, 2000) // Check every 2 seconds for faster detection

    // Refresh analytics every 30 seconds to catch status updates
    const statsInterval = setInterval(() => {
      fetchAdminStats()
    }, 30000) // Refresh every 30 seconds

    return () => {
      clearInterval(incidentInterval)
      clearInterval(statsInterval)
    }
    // Only depend on session and filter values - not on function references or changing state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.role, statusFilter, severityFilter])

  const updateStatus = useCallback(async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Status updated successfully')
        // Refresh incidents list
        await fetchIncidents()
        // Refresh analytics for admins
        if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
          await fetchAdminStats()
        }
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }, [session, fetchIncidents, fetchAdminStats])

  // Apply all filters - note: statusFilter and severityFilter are already applied server-side
  // We only need to apply searchTerm filter client-side
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = searchTerm === '' || 
      incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Double-check status filter (in case filter wasn't applied server-side)
    const matchesStatus = !statusFilter || incident.status === statusFilter
    const matchesSeverity = !severityFilter || incident.severity === severityFilter
    
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

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
                <Flame className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                <span className="text-xl md:text-2xl font-bold text-gray-900">FireResponse</span>
                <span className={`hidden md:inline px-3 py-1 text-sm font-medium rounded-full ${
                  isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base">
              {session?.user?.role === 'USER' && (
                <button
                  onClick={() => router.push('/dashboard/my-reports')}
                  className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  My Reports
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => router.push('/dashboard/map')}
                    className="hidden md:flex items-center space-x-2 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <Map className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Map</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/analytics')}
                    className="hidden md:flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <span>Analytics</span>
                  </button>
                </>
              )}
              {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') && (
                <>
                  <button
                    onClick={() => router.push('/dashboard/admin')}
                    className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Admin Panel
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/homepage')}
                    className="px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Edit Homepage
                  </button>
                </>
              )}
              {isAdmin && (
                <button
                  onClick={() => setBeepEnabled(!beepEnabled)}
                  className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                    beepEnabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={beepEnabled ? 'Disable beep notifications' : 'Enable beep notifications'}
                >
                  {beepEnabled ? (
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                  <span className="hidden md:inline">{beepEnabled ? 'Sound On' : 'Sound Off'}</span>
                </button>
              )}
              <span className="hidden md:inline text-gray-700 text-sm">{session?.user?.email}</span>
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
        {/* Admin Statistics Cards - Always visible when data is available */}
        {isAdmin && !statsLoading && (
          <>
            {stats ? (
              <>
                <div className="mb-4 md:mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard Analytics</h2>
                  <p className="text-gray-600">Real-time statistics and insights</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6 mb-4 md:mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-red-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-red-700 font-medium">Total Incidents</p>
                        <p className="text-2xl md:text-4xl font-bold text-red-900 mt-1 md:mt-2">{stats.totalIncidents ?? 0}</p>
                      </div>
                      <AlertCircle className="w-10 h-10 md:w-14 md:h-14 text-red-600 opacity-40" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-orange-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-orange-700 font-medium">Active</p>
                        <p className="text-2xl md:text-4xl font-bold text-orange-900 mt-1 md:mt-2">{stats.activeCount ?? 0}</p>
                      </div>
                      <TrendingUp className="w-10 h-10 md:w-14 md:h-14 text-orange-600 opacity-40" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-green-700 font-medium">Resolved</p>
                        <p className="text-2xl md:text-4xl font-bold text-green-900 mt-1 md:mt-2">{stats.resolvedCount ?? 0}</p>
                      </div>
                      <CheckCircle className="w-10 h-10 md:w-14 md:h-14 text-green-600 opacity-40" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-blue-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-blue-700 font-medium">Total Users</p>
                        <p className="text-2xl md:text-4xl font-bold text-blue-900 mt-1 md:mt-2">{stats.totalUsers ?? 0}</p>
                      </div>
                      <Users className="w-10 h-10 md:w-14 md:h-14 text-blue-600 opacity-40" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-purple-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-purple-700 font-medium">Stations</p>
                        <p className="text-2xl md:text-4xl font-bold text-purple-900 mt-1 md:mt-2">{stats.totalStations ?? 0}</p>
                      </div>
                      <Building2 className="w-10 h-10 md:w-14 md:h-14 text-purple-600 opacity-40" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-indigo-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-indigo-700 font-medium">Resolution Rate</p>
                        <p className="text-2xl md:text-4xl font-bold text-indigo-900 mt-1 md:mt-2">{stats.resolutionRate ?? 0}%</p>
                      </div>
                      <BarChart3 className="w-10 h-10 md:w-14 md:h-14 text-indigo-600 opacity-40" />
                    </div>
                  </motion.div>
                </div>

                {/* Admin Charts */}
                {stats.monthlyChart && stats.monthlyChart.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-sm p-4 md:p-6"
                    >
                      <h2 className="text-lg md:text-xl font-bold mb-4">Incidents Trend (6 Months)</h2>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={stats.monthlyChart}>
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
                    {stats.bySeverity && stats.bySeverity.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200"
                      >
                        <h2 className="text-lg md:text-xl font-bold mb-4">🎯 Incidents by Severity</h2>
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

                {/* Additional Admin Stats */}
                {(stats.avgResolutionHours > 0 || (stats.topReporters && stats.topReporters.length > 0) || stats.recentIncidents > 0) && (
                  <>
                    <div className="mb-3 md:mb-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">📋 Performance Metrics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
                      {stats.avgResolutionHours > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-blue-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Clock className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                            <div>
                              <p className="text-sm md:text-base text-blue-700 font-medium">Avg Resolution Time</p>
                              <p className="text-2xl md:text-3xl font-bold text-blue-900">{stats.avgResolutionHours.toFixed(1)}h</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {stats.topReporters && stats.topReporters.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200"
                        >
                          <h3 className="text-base md:text-lg font-semibold mb-3 text-gray-900">🏆 Top Reporters</h3>
                          <div className="space-y-2">
                            {stats.topReporters.slice(0, 3).map((reporter) => (
                              <div key={reporter.reporterId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs md:text-sm text-gray-700 font-medium truncate block">{reporter.name}</span>
                                  <span className="text-xs text-gray-500 truncate block">{reporter.email}</span>
                                </div>
                                <span className="text-sm md:text-base font-bold text-red-600 ml-2">{reporter.count}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {stats.recentIncidents > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 md:p-6 border-2 border-green-200"
                        >
                          <div className="flex items-center space-x-3">
                            <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                            <div>
                              <p className="text-sm md:text-base text-green-700 font-medium">Recent (24h)</p>
                              <p className="text-2xl md:text-3xl font-bold text-green-900">{stats.recentIncidents}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 md:p-8 mb-4 md:mb-6 text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-base md:text-lg font-semibold text-yellow-900 mb-2">No Statistics Available Yet</p>
                <p className="text-sm md:text-base text-yellow-800">
                  Statistics and analytics will appear here once incidents are reported in the system.
                </p>
              </div>
            )}
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
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setLoading(true)
              }}
              className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="ON_WAY">On the Way</option>
              <option value="ARRIVED">Arrived</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                setLoading(true)
              }}
              className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            {isAdmin && (
              <>
                <button
                  onClick={() => router.push('/dashboard/map')}
                  className="hidden lg:flex items-center space-x-2 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Map className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Map</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/analytics')}
                  className="hidden lg:flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <span>Analytics</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Incidents List - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 hidden md:table-header-group">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 md:px-6 py-12 text-center text-gray-500">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <motion.tr
                      key={incident.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{incident.location}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate max-w-xs">{incident.description}</div>
                            <div className="md:hidden mt-2 text-xs text-gray-500">
                              Reported: {formatDate(incident.createdAt)}
                            </div>
                          </div>
                          {isAdmin && incident.latitude && incident.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-xs whitespace-nowrap ml-2 p-1 hover:bg-blue-50 rounded"
                              title="Open in Google Maps"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="hidden md:inline">Map</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {isAdmin ? (
                          <select
                            value={incident.status}
                            onChange={(e) => updateStatus(incident.id, e.target.value)}
                            className="px-2 md:px-3 py-1 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="RECEIVED">Received</option>
                            <option value="DISPATCHED">Dispatched</option>
                            <option value="ON_WAY">On the Way</option>
                            <option value="ARRIVED">Arrived</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="FALSE_ALARM">False Alarm</option>
                          </select>
                        ) : (
                          <span className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full ${
                            incident.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                            incident.status === 'IN_PROGRESS' || incident.status === 'ON_WAY' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {incident.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`px-2 md:px-3 py-1 text-xs font-medium rounded-full ${
                          incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(incident.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          {isAdmin && incident.latitude && incident.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-xs md:text-sm"
                              title="Open location in Google Maps"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MapPin className="w-4 h-4" />
                              <span className="hidden md:inline">Map</span>
                            </a>
                          )}
                          <button
                            onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
                            className="text-red-600 hover:text-red-700 font-medium text-xs md:text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
