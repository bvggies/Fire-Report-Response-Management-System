'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Navigation, AlertCircle, Activity, RefreshCw, ChevronRight } from 'lucide-react'
import { GoogleMap } from '@/components/google-map'
import { AdminLayout } from '@/components/dashboard/admin-layout'
import { DashboardLoadingScreen } from '@/components/dashboard/loading-screen'
import { StatCard } from '@/components/dashboard/stat-card'
import { SectionHeader } from '@/components/dashboard/section-header'
import { SeverityBadge } from '@/components/dashboard/badges'
import { cn } from '@/lib/utils'

type Incident = {
  id: string
  location: string
  latitude?: number
  longitude?: number
  status: string
  severity: string
}

const LEGEND = [
  { severity: 'CRITICAL', color: 'bg-red-500', label: 'Critical' },
  { severity: 'HIGH', color: 'bg-orange-500', label: 'High' },
  { severity: 'MEDIUM', color: 'bg-amber-400', label: 'Medium' },
  { severity: 'LOW', color: 'bg-emerald-500', label: 'Low' },
]

export default function MapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchIncidents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const response = await fetch('/api/incidents')
      if (response.ok) {
        const data = await response.json()
        setIncidents(data)
      }
    } catch (error) {
      console.error('Error fetching incidents:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchIncidents()
      const interval = setInterval(() => fetchIncidents(true), 15000)
      return () => clearInterval(interval)
    }
  }, [session, fetchIncidents])

  const markers = incidents
    .filter((incident) => incident.latitude && incident.longitude)
    .map((incident) => ({
      id: incident.id,
      lat: incident.latitude!,
      lng: incident.longitude!,
      title: incident.location,
      status: incident.status,
      severity: incident.severity,
    }))

  const activeCount = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'FALSE_ALARM'
  ).length
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length
  const withoutGps = incidents.length - markers.length
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  if (status === 'loading' || loading) {
    return <DashboardLoadingScreen />
  }

  return (
    <AdminLayout
      email={session?.user?.email}
      role={session?.user?.role}
      isSuperAdmin={isSuperAdmin}
      title="Live Map"
      subtitle="Real-time geographic view of reported incidents"
      headerActions={
        <button
          type="button"
          onClick={() => fetchIncidents(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 md:text-sm"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      }
    >
      <SectionHeader
        label="Map overview"
        title="Incident geography"
        description="Markers are color-coded by severity. Click an incident below for full details."
      />

      <div className="mb-6 grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard label="On map" value={markers.length} icon={MapPin} accent="red" />
        <StatCard label="Active" value={activeCount} icon={Activity} accent="orange" delay={0.05} />
        <StatCard label="Critical" value={criticalCount} icon={AlertCircle} accent="red" delay={0.1} />
        <StatCard
          label="No GPS"
          value={withoutGps}
          icon={Navigation}
          accent="indigo"
          delay={0.15}
          subtitle="Missing coordinates"
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
        {/* Map — primary column */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:min-h-[520px]">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3 sm:px-5">
            <p className="text-sm font-semibold text-slate-900">Interactive map</p>
            <p className="text-xs text-slate-500">Pan and zoom to explore incident clusters</p>
          </div>
          <div className="relative min-h-[280px] flex-1 sm:min-h-[360px] lg:min-h-[460px]">
            <GoogleMap markers={markers} fillParent mapClassName="rounded-none" />
          </div>
        </div>

        {/* Sidebar — fixed width on desktop, full width on mobile */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72 xl:w-80">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-900">Severity legend</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-1 sm:gap-y-3">
              {LEGEND.map((item) => (
                <li key={item.severity} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className={cn('h-3 w-3 shrink-0 rounded-full ring-2 ring-white shadow', item.color)} />
                  <span className="truncate">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-h-[200px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:min-h-0 lg:max-h-[calc(520px-8rem)]">
            <div className="shrink-0 border-b border-slate-100 px-4 py-3 sm:px-5">
              <h3 className="text-sm font-bold text-slate-900">On map</h3>
              <p className="text-xs text-slate-500">{markers.length} with GPS coordinates</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              {markers.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No incidents with GPS data yet.</p>
              ) : (
                <ul className="space-y-2">
                  {incidents
                    .filter((i) => i.latitude && i.longitude)
                    .slice(0, 12)
                    .map((incident) => (
                      <li key={incident.id}>
                        <Link
                          href={`/dashboard/incidents/${incident.id}`}
                          className="flex items-center gap-2 rounded-xl border border-transparent bg-slate-50 p-3 transition hover:border-slate-200 hover:bg-slate-100"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-900">
                              {incident.location}
                            </p>
                            <div className="mt-2">
                              <SeverityBadge severity={incident.severity} />
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  )
}
