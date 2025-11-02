'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from 'lucide-react'

declare global {
  interface Window {
    google: any
  }
}

type Marker = {
  id: string
  lat: number
  lng: number
  title: string
  status?: string
  severity?: string
}

type GoogleMapProps = {
  markers?: Marker[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
}

export function GoogleMap({ markers = [], center, zoom = 12, height = '600px' }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    if (window.google) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !window.google || !scriptLoaded) return

    const mapCenter = center || (markers.length > 0
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 40.7128, lng: -74.0060 }) // Default to NYC

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })
    } else {
      mapInstanceRef.current.setCenter(mapCenter)
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    markers.forEach((marker) => {
      const markerColor =
        marker.severity === 'CRITICAL' ? 'red' :
        marker.severity === 'HIGH' ? 'orange' :
        marker.severity === 'MEDIUM' ? 'yellow' :
        'green'

      const googleMarker = new window.google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: mapInstanceRef.current,
        title: marker.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${marker.title}</h3>
            ${marker.status ? `<p style="margin: 0 0 4px 0; color: #666;">Status: ${marker.status}</p>` : ''}
            ${marker.severity ? `<p style="margin: 0; color: #666;">Severity: ${marker.severity}</p>` : ''}
          </div>
        `,
      })

      googleMarker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, googleMarker)
      })

      markersRef.current.push(googleMarker)
    })
  }, [markers, center, zoom, scriptLoaded])

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <p className="text-gray-500 mb-2">Google Maps API key not configured</p>
          <p className="text-sm text-gray-400">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    )
  }

  if (!scriptLoaded) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />
}

export function GoogleMapScript() {
  useEffect(() => {
    if (!window.google && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null
}
