'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Save, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '@/components/dashboard/admin-layout'
import { DashboardLoadingScreen } from '@/components/dashboard/loading-screen'
import { SectionHeader } from '@/components/dashboard/section-header'
import { inputClassName, labelClassName } from '@/components/dashboard/modal'

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
    return <DashboardLoadingScreen />
  }

  return (
    <AdminLayout
      email={session?.user?.email}
      role={session?.user?.role}
      isSuperAdmin={session?.user?.role === 'SUPER_ADMIN'}
      title="Homepage Editor"
      subtitle="Customize public landing page content"
      headerActions={
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 md:text-sm"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving…' : 'Save all'}</span>
        </button>
      }
    >
      <SectionHeader
        label="Content"
        title="Landing page blocks"
        description="Edit hero text and feature cards shown on the public homepage"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Object.values(contents).map((content) => (
          <div key={content.key} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">{content.title || content.key}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClassName}>Title (optional)</label>
                <input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange(content.key, 'title', e.target.value)}
                  className={inputClassName}
                  placeholder="Content title"
                />
              </div>
              <div>
                <label className={labelClassName}>Content</label>
                <textarea
                  value={content.content}
                  onChange={(e) => handleContentChange(content.key, 'content', e.target.value)}
                  rows={4}
                  className={inputClassName}
                  placeholder="Enter content…"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(contents).length === 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
          <p className="font-semibold text-amber-950">No content blocks yet</p>
          <p className="mt-1 text-sm text-amber-800/80">Click Save all to initialize default homepage content.</p>
        </div>
      )}
    </AdminLayout>
  )
}

