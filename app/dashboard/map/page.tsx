'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, ArrowLeft, MapPin } from 'lucide-react'
import { GoogleMap } from '@/components/google-map'

type Incident = {
  id: string
  location: string
  latitude?: number
  longitude?: number
  status: string
  severity: string
}

export default function MapPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchIncidents()
    }
  }, [session])

  const fetchIncidents = async () => {
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
    }
  }

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-2">
                <Flame className="w-8 h-8 text-red-600" />
                <span className="text-2xl font-bold text-gray-900">FireResponse</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-red-600" />
            <span>Fire Incidents Map</span>
          </h1>
          <p className="text-gray-600">
            View all fire incidents on the map. Markers are color-coded by severity.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <GoogleMap markers={markers} height="calc(100vh - 250px)" />
        </div>
      </div>
    </div>
  )
}
