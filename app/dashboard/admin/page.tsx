'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, Building2, UserPlus, Plus, Download, Edit, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminLayout } from '@/components/dashboard/admin-layout'
import { DashboardLoadingScreen } from '@/components/dashboard/loading-screen'
import { StatCard } from '@/components/dashboard/stat-card'
import { SectionHeader } from '@/components/dashboard/section-header'
import { Modal, inputClassName, labelClassName } from '@/components/dashboard/modal'
import { cn } from '@/lib/utils'

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
  const [summary, setSummary] = useState({ users: 0, stations: 0, personnel: 0 })

  const fetchSummary = useCallback(async () => {
    try {
      const [u, s, p] = await Promise.all([
        fetch('/api/admin/users').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/admin/stations').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/admin/personnel').then((r) => (r.ok ? r.json() : [])),
      ])
      setSummary({ users: u.length, stations: s.length, personnel: p.length })
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }, [])

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
      fetchSummary()
    }
  }, [session, activeTab, fetchData, fetchSummary])

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
        fetchSummary()
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
        fetchSummary()
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
        fetchSummary()
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
        fetchSummary()
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
        fetchSummary()
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
        fetchSummary()
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
    return <DashboardLoadingScreen />
  }

  return (
    <AdminLayout
      email={session?.user?.email}
      role={session?.user?.role}
      isSuperAdmin={session?.user?.role === 'SUPER_ADMIN'}
      title="Admin Panel"
      subtitle="Manage users, fire stations, and personnel"
      headerActions={
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 md:text-sm"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      }
    >
      <SectionHeader
        label="System"
        title="System management"
        description="Manage accounts, fire stations, and assigned personnel"
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Users" value={summary.users} icon={Users} accent="blue" />
        <StatCard label="Fire stations" value={summary.stations} icon={Building2} accent="purple" delay={0.05} />
        <StatCard label="Personnel" value={summary.personnel} icon={UserPlus} accent="indigo" delay={0.1} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
        {(
          [
            { id: 'users' as const, label: 'Users', icon: Users },
            { id: 'stations' as const, label: 'Fire stations', icon: Building2 },
            { id: 'personnel' as const, label: 'Personnel', icon: UserPlus },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-w-[120px]',
              activeTab === id
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'users' ? 'User accounts' : activeTab === 'stations' ? 'Fire stations' : 'Personnel roster'}
            </h2>
            <p className="text-sm text-slate-500">
              {activeTab === 'users' && `${users.length} registered users`}
              {activeTab === 'stations' && `${stations.length} stations`}
              {activeTab === 'personnel' && `${personnel.length} personnel records`}
            </p>
          </div>
          <button
            type="button"
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 hover:from-red-500 hover:to-orange-500"
          >
            <Plus className="h-4 w-4" />
            Add new
          </button>
        </div>

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                        No users yet. Add your first user account.
                      </td>
                    </tr>
                  ) : (
                  users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{user.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1',
                          user.role === 'SUPER_ADMIN' ? 'bg-violet-500/15 text-violet-700 ring-violet-500/20' :
                          user.role === 'ADMIN' ? 'bg-blue-500/15 text-blue-700 ring-blue-500/20' :
                          'bg-slate-500/15 text-slate-600 ring-slate-500/20'
                        )}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.phone || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Address</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Capacity</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                        No fire stations yet. Add your first station.
                      </td>
                    </tr>
                  ) : (
                  stations.map((station) => (
                    <tr key={station.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{station.name}</td>
                      <td className="max-w-xs truncate px-6 py-4 text-slate-600">{station.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{station.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{station.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{station.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditStation(station)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStation(station.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'personnel' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Badge</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Rank</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Station</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Email</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnel.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                        No personnel yet. Add team members to a station.
                      </td>
                    </tr>
                  ) : (
                  personnel.map((person) => (
                    <tr key={person.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{person.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-600">{person.badgeNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{person.rank}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{person.fireStation.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{person.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditPersonnel(person)}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePersonnel(person.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {showUserModal && (
        <Modal
          title={editingItem ? 'Edit user' : 'Add new user'}
          onClose={() => { setShowUserModal(false); setEditingItem(null) }}
        >
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <label className={labelClassName}>Name</label>
              <input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Email *</label>
              <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Phone</label>
              <input type="tel" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Role</label>
              <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className={inputClassName}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                {session?.user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
            </div>
            <div>
              <label className={labelClassName}>{editingItem ? 'New password (optional)' : 'Password *'}</label>
              <input type="password" required={!editingItem} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className={inputClassName} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowUserModal(false); setEditingItem(null) }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500">
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showStationModal && (
        <Modal
          title={editingItem ? 'Edit station' : 'Add fire station'}
          onClose={() => { setShowStationModal(false); setEditingItem(null) }}
          maxWidth="lg"
        >
          <form onSubmit={handleStationSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div>
              <label className={labelClassName}>Name *</label>
              <input type="text" required value={stationForm.name} onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Address *</label>
              <input type="text" required value={stationForm.address} onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })} className={inputClassName} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClassName}>Latitude *</label>
                <input type="number" step="any" required value={stationForm.latitude} onChange={(e) => setStationForm({ ...stationForm, latitude: e.target.value })} className={inputClassName} />
              </div>
              <div>
                <label className={labelClassName}>Longitude *</label>
                <input type="number" step="any" required value={stationForm.longitude} onChange={(e) => setStationForm({ ...stationForm, longitude: e.target.value })} className={inputClassName} />
              </div>
            </div>
            <div>
              <label className={labelClassName}>Phone *</label>
              <input type="tel" required value={stationForm.phone} onChange={(e) => setStationForm({ ...stationForm, phone: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Email *</label>
              <input type="email" required value={stationForm.email} onChange={(e) => setStationForm({ ...stationForm, email: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Capacity</label>
              <input type="number" value={stationForm.capacity} onChange={(e) => setStationForm({ ...stationForm, capacity: e.target.value })} className={inputClassName} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowStationModal(false); setEditingItem(null) }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500">
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showPersonnelModal && (
        <Modal
          title={editingItem ? 'Edit personnel' : 'Add personnel'}
          onClose={() => { setShowPersonnelModal(false); setEditingItem(null) }}
        >
          <form onSubmit={handlePersonnelSubmit} className="space-y-4">
            <div>
              <label className={labelClassName}>Name *</label>
              <input type="text" required value={personnelForm.name} onChange={(e) => setPersonnelForm({ ...personnelForm, name: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Email *</label>
              <input type="email" required value={personnelForm.email} onChange={(e) => setPersonnelForm({ ...personnelForm, email: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Phone *</label>
              <input type="tel" required value={personnelForm.phone} onChange={(e) => setPersonnelForm({ ...personnelForm, phone: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Badge number *</label>
              <input type="text" required value={personnelForm.badgeNumber} onChange={(e) => setPersonnelForm({ ...personnelForm, badgeNumber: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Rank *</label>
              <input type="text" required value={personnelForm.rank} onChange={(e) => setPersonnelForm({ ...personnelForm, rank: e.target.value })} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName}>Fire station *</label>
              <select required value={personnelForm.fireStationId} onChange={(e) => setPersonnelForm({ ...personnelForm, fireStationId: e.target.value })} className={inputClassName}>
                <option value="">Select a station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowPersonnelModal(false); setEditingItem(null) }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500">
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  )
}
