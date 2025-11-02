'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, ArrowLeft, Save, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

type HomePageContent = {
  key: string
  title?: string | null
  content: string
}

export default function HomePageEditorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contents, setContents] = useState<Record<string, HomePageContent>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
      fetchContent()
    }
  }, [session])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/homepage')
      if (response.ok) {
        const data = await response.json()
        setContents(data)
        
        // Initialize default content if empty
        if (Object.keys(data).length === 0) {
          setContents({
            heroTitle: { key: 'heroTitle', title: 'Hero Title', content: 'Quick Fire Response' },
            heroTitle2: { key: 'heroTitle2', title: 'Hero Title Part 2', content: 'System' },
            heroSubtitle: { key: 'heroSubtitle', title: 'Hero Subtitle', content: 'Report fire incidents instantly. Help save lives and property with real-time emergency response.' },
            feature1Title: { key: 'feature1Title', title: 'Feature 1 Title', content: 'GPS Location' },
            feature1Description: { key: 'feature1Description', title: 'Feature 1 Description', content: 'Automatic location detection for faster response times' },
            feature2Title: { key: 'feature2Title', title: 'Feature 2 Title', content: 'Secure & Reliable' },
            feature2Description: { key: 'feature2Description', title: 'Feature 2 Description', content: 'Your data is protected with industry-standard security' },
            feature3Title: { key: 'feature3Title', title: 'Feature 3 Title', content: 'Real-time Updates' },
            feature3Description: { key: 'feature3Description', title: 'Feature 3 Description', content: 'Track your report status in real-time' },
          })
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to load homepage content')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = Object.values(contents).map((content) =>
        fetch('/api/admin/homepage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content),
        })
      )

      await Promise.all(promises)
      toast.success('Homepage content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save homepage content')
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (key: string, field: 'title' | 'content', value: string) => {
    setContents((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

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
                <span className="text-2xl font-bold text-gray-900">Edit Homepage</span>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save All'}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Homepage Content Management</h1>
          <p className="text-gray-600">Edit the content displayed on your homepage</p>
        </div>

        <div className="space-y-6">
          {Object.values(contents).map((content) => (
            <div key={content.key} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {content.title || content.key}
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={content.title || ''}
                    onChange={(e) => handleContentChange(content.key, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Content title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={content.content}
                    onChange={(e) => handleContentChange(content.key, 'content', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter content..."
                  />
                </div>
              </div>
            </div>
          ))}

          {Object.keys(contents).length === 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">No homepage content found. Click "Save All" to initialize default content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

