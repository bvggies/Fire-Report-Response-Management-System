'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Clock,
  Activity,
} from 'lucide-react'
import { AdminLayout } from '@/components/dashboard/admin-layout'
import { DashboardLoadingScreen } from '@/components/dashboard/loading-screen'
import { StatCard } from '@/components/dashboard/stat-card'
import { SectionHeader } from '@/components/dashboard/section-header'
import { ChartPanel, CHART_COLORS, chartTooltipStyle } from '@/components/dashboard/chart-panel'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
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

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const isAdmin =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) setStats(await response.json())
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAdminStats = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/admin')
      if (response.ok) setAdminStats(await response.json())
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    if (isAdmin) fetchAdminStats()
    else fetchStats()
  }, [session, isAdmin, fetchStats, fetchAdminStats])

  if (status === 'loading' || loading) {
    return <DashboardLoadingScreen />
  }

  return (
    <AdminLayout
      email={session?.user?.email}
      role={session?.user?.role}
      isSuperAdmin={session?.user?.role === 'SUPER_ADMIN'}
      title="Analytics"
      subtitle="Deep insights into incidents, response times, and system usage"
    >
      {isAdmin && adminStats && (
        <>
          <SectionHeader
            label="Performance"
            title="System analytics"
            description="Aggregated metrics across all incidents and users"
          />

          <div className="mb-8 grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 2xl:grid-cols-6">
            <StatCard label="Total incidents" value={adminStats.totalIncidents} icon={AlertCircle} accent="red" />
            <StatCard label="Active" value={adminStats.activeCount} icon={Activity} accent="orange" delay={0.05} />
            <StatCard label="Resolved" value={adminStats.resolvedCount} icon={CheckCircle} accent="green" delay={0.1} />
            <StatCard label="Users" value={adminStats.totalUsers} icon={Users} accent="blue" delay={0.15} />
            <StatCard label="Stations" value={adminStats.totalStations} icon={Building2} accent="purple" delay={0.2} />
            <StatCard
              label="Resolution rate"
              value={`${adminStats.resolutionRate}%`}
              icon={BarChart3}
              accent="indigo"
              delay={0.25}
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {adminStats.monthlyChart.length > 0 && (
              <ChartPanel title="Incident trend" subtitle="Last 6 months — total vs resolved">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={adminStats.monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" tickLine={false} />
                    <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Total" />
                    <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2.5} dot={false} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>
            )}
            {adminStats.bySeverity.length > 0 && (
              <ChartPanel title="Severity distribution" subtitle="Share of incidents by severity level" delay={0.1}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={adminStats.bySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, count }) => `${severity}: ${count}`}
                      outerRadius={95}
                      innerRadius={52}
                      dataKey="count"
                      paddingAngle={2}
                    >
                      {adminStats.bySeverity.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartPanel>
            )}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {adminStats.byStatus.length > 0 && (
              <ChartPanel title="Status breakdown" subtitle="Incidents grouped by current status">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={adminStats.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" fontSize={10} stroke="#94a3b8" tickLine={false} />
                    <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            )}
            {adminStats.byRole.length > 0 && (
              <ChartPanel title="Users by role" subtitle="Account distribution across roles" delay={0.05}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={adminStats.byRole}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="role" fontSize={10} stroke="#94a3b8" tickLine={false} />
                    <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>
            )}
            <div className="space-y-4">
              {adminStats.avgResolutionHours > 0 && (
                <StatCard
                  label="Avg resolution"
                  value={`${adminStats.avgResolutionHours.toFixed(1)}h`}
                  icon={Clock}
                  accent="blue"
                  subtitle="Mean time to resolve"
                />
              )}
              <StatCard
                label="Last 24 hours"
                value={adminStats.recentIncidents}
                icon={TrendingUp}
                accent="green"
                subtitle="New incidents today"
              />
              {adminStats.topReporters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                >
                  <h3 className="mb-4 text-sm font-bold text-slate-900">Top reporters</h3>
                  <div className="space-y-2">
                    {adminStats.topReporters.slice(0, 5).map((reporter, i) => (
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
          </div>
        </>
      )}

      {!isAdmin && stats && (
        <>
          <SectionHeader
            label="Your activity"
            title="Report analytics"
            description="Statistics for all incidents in the system"
          />
          <div className="mb-8 grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <StatCard label="Total" value={stats.total} icon={AlertCircle} accent="red" />
            <StatCard label="Last 24h" value={stats.recent} icon={TrendingUp} accent="green" delay={0.05} />
            <StatCard
              label="Active"
              value={stats.byStatus
                .filter((s) => s.status !== 'RESOLVED' && s.status !== 'FALSE_ALARM')
                .reduce((acc, s) => acc + s.count, 0)}
              icon={Activity}
              accent="orange"
              delay={0.1}
            />
            <StatCard
              label="Resolved"
              value={stats.byStatus.find((s) => s.status === 'RESOLVED')?.count || 0}
              icon={CheckCircle}
              accent="blue"
              delay={0.15}
            />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartPanel title="By status" subtitle="Incident count per status">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="status" fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
            <ChartPanel title="By severity" subtitle="Distribution of severity levels" delay={0.1}>
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
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {stats.bySeverity.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>
        </>
      )}

      {isAdmin && !adminStats && (
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-10 text-center">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-amber-600" />
          <p className="font-semibold text-amber-950">No analytics data yet</p>
          <p className="mt-1 text-sm text-amber-800/80">Metrics will appear once incidents are recorded.</p>
        </div>
      )}
    </AdminLayout>
  )
}
