'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, LogOut, Map, Filter, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchIncidents()
    }
  }, [session, statusFilter, severityFilter])

  const fetchIncidents = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (severityFilter) params.append('severity', severityFilter)

      const response = await fetch(`/api/incidents?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setIncidents(data)
      }
    } catch (error) {
      console.error('Error fetching incidents:', error)
      toast.error('Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (incidentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Status updated successfully')
        fetchIncidents()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const filteredIncidents = incidents.filter((incident) =>
    incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">FireResponse</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
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
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <button
              onClick={() => router.push('/dashboard/map')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Map className="w-5 h-5" />
              <span>View Map</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Analytics</span>
            </button>
            {session?.user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => router.push('/dashboard/admin')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>

        {/* Incidents List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.map((incident) => (
                  <motion.tr
                    key={incident.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{incident.location}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{incident.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={incident.status}
                        onChange={(e) => updateStatus(incident.id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="RECEIVED">Received</option>
                        <option value="DISPATCHED">Dispatched</option>
                        <option value="ON_WAY">On the Way</option>
                        <option value="ARRIVED">Arrived</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="FALSE_ALARM">False Alarm</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        incident.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(incident.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredIncidents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No incidents found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
