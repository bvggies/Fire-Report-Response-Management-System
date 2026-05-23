'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Flame,
  LayoutDashboard,
  Map,
  BarChart3,
  Settings,
  Home,
  LogOut,
  Volume2,
  VolumeX,
  Menu,
  X,
  Radio,
  FileText,
  PlusCircle,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type DashboardShellProps = {
  children: React.ReactNode
  variant: 'admin' | 'user'
  email?: string | null
  role?: string
  isSuperAdmin?: boolean
  title: string
  subtitle?: string
  beepEnabled?: boolean
  onToggleBeep?: () => void
  activeCount?: number
  headerActions?: React.ReactNode
  showAdminLink?: boolean
}

const adminNav = [
  { href: '/dashboard', label: 'Operations', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/map', label: 'Live Map', icon: Map },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

const superAdminNav = [
  { href: '/dashboard/admin', label: 'Admin Panel', icon: Settings },
  { href: '/dashboard/homepage', label: 'Homepage', icon: Home },
]

const userNav = [
  { href: '/dashboard/my-reports', label: 'My Reports', icon: FileText },
  { href: '/report', label: 'Report Fire', icon: PlusCircle },
  { href: '/track', label: 'Track Report', icon: Search },
]

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/incidents')
    }
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardShell({
  children,
  variant,
  email,
  role,
  isSuperAdmin = false,
  title,
  subtitle,
  beepEnabled = true,
  onToggleBeep,
  activeCount = 0,
  headerActions,
  showAdminLink = false,
}: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const primaryNav =
    variant === 'admin'
      ? [...adminNav, ...(isSuperAdmin ? superAdminNav : [])]
      : userNav

  const NavLink = ({
    href,
    label,
    icon: Icon,
    exact,
  }: {
    href: string
    label: string
    icon: typeof LayoutDashboard
    exact?: boolean
  }) => {
    const active = isNavActive(pathname, href, exact)
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
          active
            ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/10'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', active && 'text-red-400')} />
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-slate-950 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
          <Link href={variant === 'admin' ? '/dashboard' : '/dashboard/my-reports'} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/30">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">FireResponse</p>
              <p className="text-xs text-slate-500">
                {variant === 'admin' ? 'Command Center' : 'My Account'}
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Menu
          </p>
          {primaryNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          {variant === 'user' && showAdminLink && (
            <>
              <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Admin
              </p>
              <NavLink href="/dashboard" label="Operations" icon={LayoutDashboard} exact />
            </>
          )}
        </nav>

        <div className="space-y-2 border-t border-white/5 p-4">
          {variant === 'admin' && onToggleBeep && (
            <button
              type="button"
              onClick={onToggleBeep}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                beepEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              {beepEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              {beepEnabled ? 'Alert sounds on' : 'Alert sounds off'}
            </button>
          )}

          {variant === 'admin' && (
            <button
              type="button"
              onClick={() => router.push('/report')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:from-red-500 hover:to-orange-500"
            >
              <PlusCircle className="h-4 w-4" />
              New report
            </button>
          )}

          <div className="rounded-xl bg-white/5 p-3">
            <p className="truncate text-xs font-medium text-white">{email}</p>
            {role && (
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                {role.replace('_', ' ')}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="hidden truncate text-sm text-slate-500 sm:block">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {variant === 'admin' && (
                <>
                  <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">Live</span>
                  </div>
                  {activeCount > 0 && (
                    <div className="hidden items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 md:flex">
                      <Radio className="h-3.5 w-3.5 text-red-600" />
                      <span className="text-xs font-semibold text-red-800">{activeCount} active</span>
                    </div>
                  )}
                </>
              )}
              {headerActions}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}

export type AdminLayoutProps = Omit<DashboardShellProps, 'variant' | 'title' | 'subtitle'> & {
  title?: string
  subtitle?: string
}

export function AdminLayout({
  title = 'Operations Dashboard',
  subtitle = 'Monitor incidents and coordinate response in real time',
  ...props
}: AdminLayoutProps) {
  return <DashboardShell variant="admin" title={title} subtitle={subtitle} {...props} />
}
