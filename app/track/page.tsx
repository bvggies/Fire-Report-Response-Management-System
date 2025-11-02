'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Flame, MapPin, Clock, AlertCircle, CheckCircle, Loader, XCircle, Copy } from 'lucide-react'
import { BackgroundVectors } from '@/components/background-vectors'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

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
    setLoading(true)
    try {
      const response = await fetch(`/api/incidents/${id}`)
      if (response.ok) {
        const data = await response.json()
        setIncident(data)
      } else {
        toast.error('Incident not found. Please check your Incident ID.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching incident:', error)
      toast.error('Error loading incident. Please try again.')
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
          <nav className="container mx-auto px-4 py-4 md:py-6">
            <Link href="/" className="flex items-center space-x-2">
              <Flame className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <span className="text-xl md:text-2xl font-bold text-gray-900">FireResponse</span>
            </Link>
          </nav>

          <div className="container mx-auto px-4 py-12 md:py-20 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8"
            >
              <div className="text-center mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Track Your Report</h1>
                <p className="text-sm md:text-base text-gray-600">Enter your Incident ID to check the status</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                <p className="text-xs md:text-sm text-blue-800">
                  <strong>Where to find your Incident ID?</strong><br />
                  After submitting a report, you'll receive a unique Incident ID. 
                  Check your email or the confirmation message you received.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident ID <span className="text-red-600">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleTrack()
                        }
                      }}
                      placeholder="Enter your incident ID..."
                      className="flex-1 px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-xs md:text-sm"
                    />
                    <button
                      onClick={handleTrack}
                      disabled={!trackingId.trim()}
                      className="px-4 md:px-6 py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      Track
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Don't have an ID? <Link href="/report" className="text-red-600 hover:underline">Submit a new report</Link>
                  </p>
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
        <nav className="container mx-auto px-4 py-4 md:py-6">
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            <span className="text-xl md:text-2xl font-bold text-gray-900">FireResponse</span>
          </Link>
        </nav>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Incident Report</h1>
              <div className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg ${status.color}`}>
                {status.icon}
                <span className="font-semibold text-sm md:text-base">{status.label}</span>
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
                <div className="flex items-center space-x-2">
                  <p className="flex-1 text-gray-900 font-mono text-sm bg-gray-50 p-4 rounded-lg">{incident.id}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(incident.id)
                      toast.success('Incident ID copied to clipboard!')
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy Incident ID"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Save this ID to track your report status anytime
                </p>
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
