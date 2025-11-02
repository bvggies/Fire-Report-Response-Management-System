'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MapPin, Camera, Video, Send, AlertCircle } from 'lucide-react'
import { BackgroundVectors } from '@/components/background-vectors'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

const reportSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
  reporterEmail: z.string().email().optional().or(z.literal('')),
  anonymous: z.boolean().default(false),
})

type ReportForm = z.infer<typeof reportSchema>

export default function ReportPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [location, setLocation] = useState({ lat: 0, lng: 0 })
  const [locationName, setLocationName] = useState('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      severity: 'MEDIUM',
      anonymous: false,
      reporterName: '',
      reporterPhone: '',
      reporterEmail: '',
    },
  })

  const isAnonymous = watch('anonymous')

  // Auto-fill user information if logged in
  useEffect(() => {
    if (session?.user && !isAnonymous) {
      // Update form values when session is available
      if (session.user.name) {
        setValue('reporterName', session.user.name)
      }
      if (session.user.email) {
        setValue('reporterEmail', session.user.email)
      }
      if (session.user.phone) {
        setValue('reporterPhone', session.user.phone)
      }
    } else if (isAnonymous) {
      // Clear fields if user chooses anonymous
      setValue('reporterName', '')
      setValue('reporterEmail', '')
      setValue('reporterPhone', '')
    }
  }, [session, isAnonymous, setValue])

  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })
          setValue('latitude', lat)
          setValue('longitude', lng)

          // Reverse geocoding
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            )
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              setLocationName(data.results[0].formatted_address)
              setValue('location', data.results[0].formatted_address)
            }
          } catch (error) {
            console.error('Error fetching location name:', error)
          }
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setIsLoadingLocation(false)
          toast.error('Could not fetch your location. Please enter manually.')
        }
      )
    }
  }, [setValue])

  const handleFileUpload = async (file: File, type: 'photo' | 'video') => {
    // In production, upload to Cloudinary or similar service
    // For now, we'll use a placeholder
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (type === 'photo') {
        setPhotos([...photos, result])
      } else {
        setVideos([...videos, result])
      }
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: ReportForm) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          photos,
          videos,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.details || 'Failed to submit report')
      }

      const result = await response.json()
      const incidentId = result.id
      
      // Show success with ID
      toast.success(
        `Report submitted successfully! Redirecting...`,
        { duration: 2000 }
      )
      
      // Redirect based on user role
      setTimeout(() => {
        if (session?.user?.role === 'USER') {
          // Redirect logged-in users to their reports page
          router.push('/dashboard/my-reports')
        } else {
          // Redirect guests to track page
          router.push(`/track?id=${incidentId}`)
        }
      }, 2000)
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to submit report. Please try again.'
      toast.error(errorMessage)
      console.error('Report submission error:', error)
      
      // If database schema error, show helpful message
      if (errorMessage.includes('schema') || errorMessage.includes('does not exist')) {
        toast.error('Database not set up. Please contact administrator.', { duration: 8000 })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <BackgroundVectors />
      
      <div className="relative z-10">
        {/* Navigation - Mobile Optimized */}
        <nav className="container mx-auto px-4 py-4 md:py-6">
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            <span className="text-xl md:text-2xl font-bold text-gray-900">FireResponse</span>
          </Link>
        </nav>

        <div className="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3 mb-6 md:mb-8">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Report Fire Incident</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-600">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('location')}
                    value={locationName}
                    onChange={(e) => {
                      setLocationName(e.target.value)
                      setValue('location', e.target.value)
                    }}
                    placeholder="Enter location or use GPS"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {isLoadingLocation && (
                    <span className="text-sm text-gray-500">Loading...</span>
                  )}
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
                {location.lat !== 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe the fire incident in detail..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity <span className="text-red-600">*</span>
                </label>
                <select
                  {...register('severity')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos / Videos
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label className="flex-1 flex flex-col sm:flex-row items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                    <Camera className="w-5 h-5 sm:mr-2 mb-1 sm:mb-0 text-gray-400" />
                    <span className="text-sm text-gray-600 text-center sm:text-left">Add Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files
                        if (files) {
                          Array.from(files).forEach((file) => handleFileUpload(file, 'photo'))
                        }
                      }}
                    />
                  </label>
                  <label className="flex-1 flex flex-col sm:flex-row items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                    <Video className="w-5 h-5 sm:mr-2 mb-1 sm:mb-0 text-gray-400" />
                    <span className="text-sm text-gray-600 text-center sm:text-left">Add Videos</span>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files
                        if (files) {
                          Array.from(files).forEach((file) => handleFileUpload(file, 'video'))
                        }
                      }}
                    />
                  </label>
                </div>
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              {/* Reporter Info */}
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('anonymous')}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Report anonymously</span>
                </label>

                {!isAnonymous && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name {session?.user?.name && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                      </label>
                      <input
                        type="text"
                        {...register('reporterName')}
                        placeholder="Your name"
                        defaultValue={session?.user?.name || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone {session?.user?.phone && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                      </label>
                      <input
                        type="tel"
                        {...register('reporterPhone')}
                        placeholder="Your phone"
                        defaultValue={session?.user?.phone || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email {session?.user?.email && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                      </label>
                      <input
                        type="email"
                        {...register('reporterEmail')}
                        placeholder="Your email"
                        defaultValue={session?.user?.email || ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
