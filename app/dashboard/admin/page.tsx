'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flame, ArrowLeft, Users, Building2, UserPlus, Plus, Download, Edit, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'

type User = {
  id: string
  name: string | null
  email: string
  role: string
  phone?: string | null
  createdAt: string
}

type FireStation = {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phone: string
  email: string
  capacity: number
}

type Personnel = {
  id: string
  name: string
  email: string
  phone: string
  badgeNumber: string
  rank: string
  fireStationId: string
  fireStation: FireStation
}

export default function AdminPanelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'stations' | 'personnel'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [stations, setStations] = useState<FireStation[]>([])
  const [personnel, setPersonnel] = useState<Personnel[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showStationModal, setShowStationModal] = useState(false)
  const [showPersonnelModal, setShowPersonnelModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', role: 'USER', password: '' })
  const [stationForm, setStationForm] = useState({ name: '', address: '', latitude: '', longitude: '', phone: '', email: '', capacity: '10' })
  const [personnelForm, setPersonnelForm] = useState({ name: '', email: '', phone: '', badgeNumber: '', rank: '', fireStationId: '' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        } else {
          toast.error('Failed to load users')
        }
      } else if (activeTab === 'stations') {
        const response = await fetch('/api/admin/stations')
        if (response.ok) {
          const data = await response.json()
          setStations(data)
        } else {
          toast.error('Failed to load stations')
        }
      } else if (activeTab === 'personnel') {
        const response = await fetch('/api/admin/personnel')
        if (response.ok) {
          const data = await response.json()
          setPersonnel(data)
        } else {
          toast.error('Failed to load personnel')
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPER_ADMIN') {
      // ADMIN and SUPER_ADMIN can access this panel
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session && (session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN')) {
      fetchData()
    }
  }, [session, activeTab, fetchData])

  // User operations
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem ? `/api/admin/users/${editingItem.id}` : '/api/admin/users'
      const method = editingItem ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      })

      if (response.ok) {
        toast.success(editingItem ? 'User updated successfully' : 'User created successfully')
        setShowUserModal(false)
        setEditingItem(null)
        setUserForm({ name: '', email: '', phone: '', role: 'USER', password: '' })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save user')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Failed to save user')
    }
  }

  const handleEditUser = (user: User) => {
    setEditingItem(user)
    setUserForm({
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  // Station operations
  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem ? `/api/admin/stations/${editingItem.id}` : '/api/admin/stations'
      const method = editingItem ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stationForm),
      })

      if (response.ok) {
        toast.success(editingItem ? 'Station updated successfully' : 'Station created successfully')
        setShowStationModal(false)
        setEditingItem(null)
        setStationForm({ name: '', address: '', latitude: '', longitude: '', phone: '', email: '', capacity: '10' })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save station')
      }
    } catch (error) {
      console.error('Error saving station:', error)
      toast.error('Failed to save station')
    }
  }

  const handleEditStation = (station: FireStation) => {
    setEditingItem(station)
    setStationForm({
      name: station.name,
      address: station.address,
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString(),
      phone: station.phone,
      email: station.email,
      capacity: station.capacity.toString(),
    })
    setShowStationModal(true)
  }

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return

    try {
      const response = await fetch(`/api/admin/stations/${stationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Station deleted successfully')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete station')
      }
    } catch (error) {
      console.error('Error deleting station:', error)
      toast.error('Failed to delete station')
    }
  }

  // Personnel operations
  const handlePersonnelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem ? `/api/admin/personnel/${editingItem.id}` : '/api/admin/personnel'
      const method = editingItem ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personnelForm),
      })

      if (response.ok) {
        toast.success(editingItem ? 'Personnel updated successfully' : 'Personnel created successfully')
        setShowPersonnelModal(false)
        setEditingItem(null)
        setPersonnelForm({ name: '', email: '', phone: '', badgeNumber: '', rank: '', fireStationId: '' })
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save personnel')
      }
    } catch (error) {
      console.error('Error saving personnel:', error)
      toast.error('Failed to save personnel')
    }
  }

  const handleEditPersonnel = (person: Personnel) => {
    setEditingItem(person)
    setPersonnelForm({
      name: person.name,
      email: person.email,
      phone: person.phone,
      badgeNumber: person.badgeNumber,
      rank: person.rank,
      fireStationId: person.fireStationId,
    })
    setShowPersonnelModal(true)
  }

  const handleDeletePersonnel = async (personnelId: string) => {
    if (!confirm('Are you sure you want to delete this personnel?')) return

    try {
      const response = await fetch(`/api/admin/personnel/${personnelId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Personnel deleted successfully')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to delete personnel')
      }
    } catch (error) {
      console.error('Error deleting personnel:', error)
      toast.error('Failed to delete personnel')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fire-response-data-${new Date().toISOString()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Export successful')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Export failed')
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
                <span className="text-2xl font-bold text-gray-900">Admin Panel</span>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">System Management</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('stations')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'stations'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-5 h-5 inline-block mr-2" />
              Fire Stations
            </button>
            <button
              onClick={() => setActiveTab('personnel')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'personnel'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlus className="w-5 h-5 inline-block mr-2" />
              Personnel
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {activeTab === 'users' ? 'Users' : activeTab === 'stations' ? 'Fire Stations' : 'Personnel'}
            </h2>
            <button
              onClick={() => {
                setEditingItem(null)
                if (activeTab === 'users') {
                  setUserForm({ name: '', email: '', phone: '', role: 'USER', password: '' })
                  setShowUserModal(true)
                } else if (activeTab === 'stations') {
                  setStationForm({ name: '', address: '', latitude: '', longitude: '', phone: '', email: '', capacity: '10' })
                  setShowStationModal(true)
                } else {
                  setPersonnelForm({ name: '', email: '', phone: '', badgeNumber: '', rank: '', fireStationId: '' })
                  setShowPersonnelModal(true)
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.phone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stations.map((station) => (
                    <tr key={station.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{station.name}</td>
                      <td className="px-6 py-4">{station.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{station.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditStation(station)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStation(station.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'personnel' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {personnel.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{person.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{person.badgeNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{person.rank}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{person.fireStation.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{person.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPersonnel(person)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePersonnel(person.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => { setShowUserModal(false); setEditingItem(null) }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{editingItem ? 'New Password (leave empty to keep current)' : 'Password *'}</label>
                <input
                  type="password"
                  required={!editingItem}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowUserModal(false); setEditingItem(null) }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Save className="w-4 h-4 inline mr-2" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Station Modal */}
      {showStationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Station' : 'Add New Station'}</h2>
              <button onClick={() => { setShowStationModal(false); setEditingItem(null) }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleStationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={stationForm.name}
                  onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={stationForm.address}
                  onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={stationForm.latitude}
                    onChange={(e) => setStationForm({ ...stationForm, latitude: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={stationForm.longitude}
                    onChange={(e) => setStationForm({ ...stationForm, longitude: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={stationForm.phone}
                  onChange={(e) => setStationForm({ ...stationForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={stationForm.email}
                  onChange={(e) => setStationForm({ ...stationForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  value={stationForm.capacity}
                  onChange={(e) => setStationForm({ ...stationForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowStationModal(false); setEditingItem(null) }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Save className="w-4 h-4 inline mr-2" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personnel Modal */}
      {showPersonnelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Personnel' : 'Add New Personnel'}</h2>
              <button onClick={() => { setShowPersonnelModal(false); setEditingItem(null) }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handlePersonnelSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={personnelForm.name}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={personnelForm.email}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={personnelForm.phone}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Badge Number *</label>
                <input
                  type="text"
                  required
                  value={personnelForm.badgeNumber}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, badgeNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rank *</label>
                <input
                  type="text"
                  required
                  value={personnelForm.rank}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, rank: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fire Station *</label>
                <select
                  required
                  value={personnelForm.fireStationId}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, fireStationId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a station</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowPersonnelModal(false); setEditingItem(null) }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Save className="w-4 h-4 inline mr-2" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
