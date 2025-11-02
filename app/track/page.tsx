'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Flame, MapPin, Clock, AlertCircle, CheckCircle, Loader, XCircle } from 'lucide-react'
import { BackgroundVectors } from '@/components/background-vectors'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'

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

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  RECEIVED: {
    label: 'Received',
    color: 'bg-blue-100 text-blue-800',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  DISPATCHED: {
    label: 'Dispatched',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <Loader className="w-5 h-5" />,
  },
  ON_WAY: {
    label: 'On the Way',
    color: 'bg-orange-100 text-orange-800',
    icon: <Loader className="w-5 h-5" />,
  },
  ARRIVED: {
    label: 'Arrived',
    color: 'bg-purple-100 text-purple-800',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-indigo-100 text-indigo-800',
    icon: <Loader className="w-5 h-5" />,
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  FALSE_ALARM: {
    label: 'False Alarm',
    color: 'bg-gray-100 text-gray-800',
    icon: <XCircle className="w-5 h-5" />,
  },
}

export default function TrackPage() {
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('id')
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackingId, setTrackingId] = useState(incidentId || '')

  useEffect(() => {
    if (incidentId) {
      fetchIncident(incidentId)
    } else {
      setLoading(false)
    }
  }, [incidentId])

  const fetchIncident = async (id: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`)
      if (response.ok) {
        const data = await response.json()
        setIncident(data)
      } else {
        alert('Incident not found')
      }
    } catch (error) {
      console.error('Error fetching incident:', error)
      alert('Error loading incident')
    } finally {
      setLoading(false)
    }
  }

  const handleTrack = () => {
    if (trackingId) {
      fetchIncident(trackingId)
    }
  }

  if (!incidentId && !incident) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <BackgroundVectors />
        
        <div className="relative z-10">
          <nav className="container mx-auto px-4 py-6">
            <Link href="/" className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">FireResponse</span>
            </Link>
          </nav>

          <div className="container mx-auto px-4 py-20 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <h1 className="text-3xl font-bold mb-6">Track Your Report</h1>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident ID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Enter your incident ID"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleTrack}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Track
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (!incident) {
    return null
  }

  const status = statusConfig[incident.status] || statusConfig.RECEIVED

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <BackgroundVectors />
      
      <div className="relative z-10">
        <nav className="container mx-auto px-4 py-6">
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">FireResponse</span>
          </Link>
        </nav>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Incident Report</h1>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${status.color}`}>
                {status.icon}
                <span className="font-semibold">{status.label}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Location
                  </label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-900 font-medium">{incident.location}</p>
                  </div>
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
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Incident ID
                </label>
                <p className="text-gray-900 font-mono text-sm bg-gray-50 p-4 rounded-lg">{incident.id}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                href="/report"
                className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Report Another Incident
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
