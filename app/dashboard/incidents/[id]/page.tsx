'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { MapPin, Clock, User, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { AdminLayout, DashboardShell } from '@/components/dashboard/admin-layout'
import { DashboardLoadingScreen } from '@/components/dashboard/loading-screen'

type Incident = {
  id: string
  location: string
  description: string
  status: string
  severity: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  photos: string[]
  videos: string[]
  reporterName?: string | null
  reporterEmail?: string | null
  reporterPhone?: string | null
  latitude?: number | null
  longitude?: number | null
  reporter?: {
    name?: string | null
    email?: string | null
    phone?: string | null
  }
}

export default function IncidentDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchIncident = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/incidents/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to load incident')
      }
      
      const data = await response.json()
      setIncident(data)
    } catch (error: any) {
      console.error('Error fetching incident:', error)
      toast.error(error.message || 'Failed to load incident details')
      // Redirect back after error
      setTimeout(() => {
        if (session) {
          router.push('/dashboard/my-reports')
        } else {
          router.push('/track')
        }
      }, 2000)
    } finally {
      setLoading(false)
    }
  }, [session, router])

  useEffect(() => {
    if (params.id) {
      fetchIncident(params.id as string)
    }
  }, [params.id, fetchIncident])

  const updateStatus = useCallback(async (newStatus: string) => {
    if (!incident) return

    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Status updated successfully')
        // Refresh incident details
        await fetchIncident(incident.id)
        // Redirect after a short delay to see refreshed analytics
        setTimeout(() => {
          if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
            router.push('/dashboard')
          } else {
            router.push('/dashboard/my-reports')
          }
        }, 1500)
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }, [incident, fetchIncident, session, router])

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  if (loading) {
    return <DashboardLoadingScreen />
  }

  if (!incident && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg mb-4">Incident not found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!incident) {
    return null
  }

  const detailContent = (
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-slate-400">ID: {incident.id.slice(0, 12)}…</p>
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') ? (
              <select
                value={incident.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                incident.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                incident.status === 'IN_PROGRESS' || incident.status === 'ON_WAY' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {incident.status.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Location
                </label>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-900 font-medium">{incident.location}</p>
                  </div>
                  {incident.latitude && incident.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                      title="Open in Google Maps"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Open in Maps</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {incident.latitude && incident.longitude && (
                  <p className="mt-2 text-xs text-gray-500">
                    Coordinates: {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Severity
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {incident.severity}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Reported At
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900">{formatDate(incident.createdAt)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Last Updated
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-900">{formatDate(incident.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Description
              </label>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{incident.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Incident ID
              </label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">{incident.id}</p>
            </div>

            {(incident.reporterName || incident.reporterEmail || incident.reporterPhone || incident.reporter) && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Reporter Information
                </label>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {(incident.reporterName || incident.reporter?.name) && (
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <p className="text-gray-900">{incident.reporterName || incident.reporter?.name}</p>
                    </div>
                  )}
                  {(incident.reporterEmail || incident.reporter?.email) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">📧</span>
                      <p className="text-gray-900">{incident.reporterEmail || incident.reporter?.email}</p>
                    </div>
                  )}
                  {(incident.reporterPhone || incident.reporter?.phone) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">📞</span>
                      <p className="text-gray-900">{incident.reporterPhone || incident.reporter?.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {incident.photos && incident.photos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Photos
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {incident.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {incident.videos && incident.videos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Videos
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {incident.videos.map((video, idx) => (
                    <video
                      key={idx}
                      src={video}
                      controls
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
  )

  if (isAdmin) {
    return (
      <AdminLayout
        email={session?.user?.email}
        role={session?.user?.role}
        isSuperAdmin={session?.user?.role === 'SUPER_ADMIN'}
        title="Incident Details"
        subtitle={incident.location}
      >
        {detailContent}
      </AdminLayout>
    )
  }

  return (
    <DashboardShell
      variant="user"
      email={session?.user?.email}
      role={session?.user?.role}
      title="Incident Details"
      subtitle={incident.location}
      showAdminLink={false}
    >
      {detailContent}
    </DashboardShell>
  )
}
