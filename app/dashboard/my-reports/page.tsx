'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, LogOut, Search, Filter, FileText, Calendar, MapPin, AlertCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'

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

const statusConfig: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: 'Received', color: 'bg-blue-100 text-blue-800' },
  DISPATCHED: { label: 'Dispatched', color: 'bg-yellow-100 text-yellow-800' },
  ON_WAY: { label: 'On the Way', color: 'bg-orange-100 text-orange-800' },
  ARRIVED: { label: 'Arrived', color: 'bg-purple-100 text-purple-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  FALSE_ALARM: { label: 'False Alarm', color: 'bg-gray-100 text-gray-800' },
}

export default function MyReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchMyReports()
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
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">FireResponse</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                My Reports
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/report"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Report Incident
              </Link>
              <span className="text-gray-700">{session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reported Incidents</h1>
          <p className="text-gray-600">Track the status of all your fire incident reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by location, description, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

        {/* Reports List */}
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6">You haven't reported any fire incidents yet.</p>
            <Link
              href="/report"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Report Your First Incident
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredIncidents.map((incident) => {
              const status = statusConfig[incident.status] || statusConfig.RECEIVED
              return (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{incident.location}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Reported: {formatDate(incident.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
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
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <Link
                        href={`/track?id=${incident.id}`}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
