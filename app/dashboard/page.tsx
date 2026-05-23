'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, AlertCircle, CheckCircle, BarChart3, TrendingUp, Users, Building2, Clock, MapPin, ChevronRight, Activity, Filter, X } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { AdminLayout, DashboardShell } from '@/components/dashboard/admin-layout'
import { DashboardLoadingScreen } from '@/components/dashboard/loading-screen'
import { StatCard } from '@/components/dashboard/stat-card'
import { SeverityBadge, StatusBadge } from '@/components/dashboard/badges'

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

const CHART_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.15)',
  fontSize: 13,
}

type QueueFilter = 'active' | 'all' | 'resolved' | 'critical'
type DateFilter = 'all' | 'today' | '7days'
type SortBy = 'newest' | 'oldest' | 'severity'

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}

const isActiveStatus = (status: string) => status !== 'RESOLVED' && status !== 'FALSE_ALARM'

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
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('active')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
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
        if (isAdmin && beepEnabled && !statusFilter && !severityFilter && queueFilter === 'active' && dateFilter === 'all' && !searchTerm) {
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
      if (!statusFilter && !severityFilter && queueFilter === 'active' && dateFilter === 'all' && !searchTerm) {
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
  }, [session?.user?.role, statusFilter, severityFilter, queueFilter, dateFilter, searchTerm])

  const clearIncidentFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setSeverityFilter('')
    setQueueFilter('active')
    setDateFilter('all')
    setSortBy('newest')
    setLoading(true)
  }

  const hasCustomFilters =
    searchTerm !== '' ||
    statusFilter !== '' ||
    severityFilter !== '' ||
    queueFilter !== 'active' ||
    dateFilter !== 'all' ||
    sortBy !== 'newest'

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

  const filteredIncidents = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const filtered = incidents.filter((incident) => {
      const matchesSearch =
        searchTerm === '' ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = !statusFilter || incident.status === statusFilter
      const matchesSeverity = !severityFilter || incident.severity === severityFilter

      const matchesQueue =
        queueFilter === 'all' ||
        (queueFilter === 'active' && isActiveStatus(incident.status)) ||
        (queueFilter === 'resolved' && incident.status === 'RESOLVED') ||
        (queueFilter === 'critical' && incident.severity === 'CRITICAL')

      const created = new Date(incident.createdAt)
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && created.toDateString() === now.toDateString()) ||
        (dateFilter === '7days' && created >= weekAgo)

      return matchesSearch && matchesStatus && matchesSeverity && matchesQueue && matchesDate
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
    })
  }, [incidents, searchTerm, statusFilter, severityFilter, queueFilter, dateFilter, sortBy])

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  if (status === 'loading' || loading) {
    return <DashboardLoadingScreen />
  }

  const dashboardContent = (
    <>
        {isAdmin && statsLoading && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/80" />
            ))}
          </div>
        )}

        {isAdmin && !statsLoading && (
          <>
            {stats ? (
              <>
                <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-600">Overview</p>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                      Response metrics
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">
                    {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} shown
                  </p>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                  <StatCard label="Total incidents" value={stats.totalIncidents ?? 0} icon={AlertCircle} accent="red" />
                  <StatCard label="Active" value={stats.activeCount ?? 0} icon={Activity} accent="orange" delay={0.05} />
                  <StatCard label="Resolved" value={stats.resolvedCount ?? 0} icon={CheckCircle} accent="green" delay={0.1} />
                  <StatCard label="Users" value={stats.totalUsers ?? 0} icon={Users} accent="blue" delay={0.15} />
                  <StatCard label="Stations" value={stats.totalStations ?? 0} icon={Building2} accent="purple" delay={0.2} />
                  <StatCard
                    label="Resolution rate"
                    value={`${stats.resolutionRate ?? 0}%`}
                    icon={BarChart3}
                    accent="indigo"
                    delay={0.25}
                  />
                </div>

                {stats.monthlyChart && stats.monthlyChart.length > 0 && (
                  <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6"
                    >
                      <h3 className="mb-1 text-sm font-bold text-slate-900">Incident trend</h3>
                      <p className="mb-4 text-xs text-slate-500">Last 6 months — total vs resolved</p>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={stats.monthlyChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" tickLine={false} />
                          <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={chartTooltipStyle} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Total" />
                          <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2.5} dot={false} name="Resolved" />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                    {stats.bySeverity && stats.bySeverity.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6"
                      >
                        <h3 className="mb-1 text-sm font-bold text-slate-900">Severity distribution</h3>
                        <p className="mb-4 text-xs text-slate-500">Breakdown of all reported incidents</p>
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={stats.bySeverity}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ severity, count }) => `${severity}: ${count}`}
                              outerRadius={88}
                              innerRadius={48}
                              fill="#8884d8"
                              dataKey="count"
                              paddingAngle={2}
                            >
                              {stats.bySeverity.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={chartTooltipStyle} />
                          </PieChart>
                        </ResponsiveContainer>
                      </motion.div>
                    )}
                  </div>
                )}

                {(stats.avgResolutionHours > 0 || (stats.topReporters && stats.topReporters.length > 0) || stats.recentIncidents > 0) && (
                  <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {stats.avgResolutionHours > 0 && (
                      <StatCard
                        label="Avg resolution"
                        value={`${stats.avgResolutionHours.toFixed(1)}h`}
                        icon={Clock}
                        accent="blue"
                        subtitle="Mean time to resolve"
                      />
                    )}
                    {stats.recentIncidents > 0 && (
                      <StatCard
                        label="Last 24 hours"
                        value={stats.recentIncidents}
                        icon={TrendingUp}
                        accent="green"
                        subtitle="New incidents today"
                      />
                    )}
                    {stats.topReporters && stats.topReporters.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 md:col-span-1"
                      >
                        <h3 className="mb-4 text-sm font-bold text-slate-900">Top reporters</h3>
                        <div className="space-y-2">
                          {stats.topReporters.slice(0, 3).map((reporter, i) => (
                            <div
                              key={reporter.reporterId}
                              className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600">
                                {i + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{reporter.name}</p>
                                <p className="truncate text-xs text-slate-500">{reporter.email}</p>
                              </div>
                              <span className="text-sm font-bold text-red-600">{reporter.count}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="mb-8 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
                <BarChart3 className="mx-auto mb-3 h-10 w-10 text-amber-600" />
                <p className="font-semibold text-amber-950">No statistics yet</p>
                <p className="mt-1 text-sm text-amber-800/80">
                  Metrics will appear once incidents are reported.
                </p>
              </div>
            )}
          </>
        )}

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Incidents</p>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Active queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredIncidents.length} of {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
            </p>
          </div>
          {hasCustomFilters && (
            <button
              type="button"
              onClick={clearIncidentFilters}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 sm:self-auto"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Filter className="h-4 w-4 text-red-500" />
            Filters
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                { id: 'active' as const, label: 'Active only' },
                { id: 'all' as const, label: 'All' },
                { id: 'critical' as const, label: 'Critical' },
                { id: 'resolved' as const, label: 'Resolved' },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  const hadServerFilter = statusFilter !== '' || severityFilter !== ''
                  setQueueFilter(chip.id)
                  if (chip.id === 'critical') {
                    setSeverityFilter('CRITICAL')
                    setStatusFilter('')
                    setLoading(true)
                  } else if (chip.id === 'resolved') {
                    setStatusFilter('RESOLVED')
                    setSeverityFilter('')
                    setLoading(true)
                  } else {
                    setStatusFilter('')
                    setSeverityFilter('')
                    if (hadServerFilter) setLoading(true)
                  }
                }}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
                  queueFilter === chip.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="relative sm:col-span-2 lg:col-span-3 xl:col-span-2">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search location, description, ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setQueueFilter('all')
                setLoading(true)
              }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">All statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="ON_WAY">On the Way</option>
              <option value="ARRIVED">Arrived</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_ALARM">False Alarm</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                if (e.target.value) setQueueFilter('all')
                setLoading(true)
              }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="">All severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="severity">Highest severity</option>
            </select>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {filteredIncidents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-500">
              No incidents found
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{incident.location}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{incident.description}</p>
                  </div>
                  <SeverityBadge severity={incident.severity} />
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {isAdmin ? (
                    <select
                      value={incident.status}
                      onChange={(e) => updateStatus(incident.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
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
                    <StatusBadge status={incident.status} />
                  )}
                </div>
                <p className="mb-3 text-xs text-slate-400">{formatDate(incident.createdAt)}</p>
                <div className="flex items-center gap-2">
                  {isAdmin && incident.latitude && incident.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Map
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                  >
                    Details
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Reported
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      No incidents found
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((incident) => (
                    <motion.tr
                      key={incident.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{incident.location}</p>
                        <p className="mt-0.5 max-w-md truncate text-sm text-slate-500">{incident.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        {isAdmin ? (
                          <select
                            value={incident.status}
                            onChange={(e) => updateStatus(incident.id, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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
                          <StatusBadge status={incident.status} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={incident.severity} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {formatDate(incident.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && incident.latitude && incident.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Map
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            View
                            <ChevronRight className="h-3.5 w-3.5" />
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
    </>
  )

  if (isAdmin) {
    return (
      <AdminLayout
        email={session?.user?.email}
        role={session?.user?.role}
        isSuperAdmin={session?.user?.role === 'SUPER_ADMIN'}
        beepEnabled={beepEnabled}
        onToggleBeep={() => setBeepEnabled(!beepEnabled)}
        activeCount={stats?.activeCount ?? 0}
      >
        {dashboardContent}
      </AdminLayout>
    )
  }

  return (
    <DashboardShell
      variant="user"
      email={session?.user?.email}
      role={session?.user?.role}
      title="My Dashboard"
      subtitle="View and track your submitted fire reports"
      showAdminLink={isAdmin}
    >
      {dashboardContent}
    </DashboardShell>
  )
}
