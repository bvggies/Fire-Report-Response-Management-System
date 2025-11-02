'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, ArrowLeft, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type Stats = {
  total: number
  byStatus: { status: string; count: number }[]
  bySeverity: { severity: string; count: number }[]
  recent: number
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
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
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-red-600" />
          <span>Analytics Dashboard</span>
        </h1>

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Incidents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recent (24h)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recent}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.byStatus.filter(s => s.status !== 'RESOLVED' && s.status !== 'FALSE_ALARM').reduce((acc, s) => acc + s.count, 0)}
                    </p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resolved</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.byStatus.find(s => s.status === 'RESOLVED')?.count || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Incidents by Status</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Incidents by Severity</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.bySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, count }) => `${severity}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.bySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
