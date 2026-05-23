import { Flame } from 'lucide-react'

export function DashboardLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-slate-200 border-t-red-600" />
          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white shadow-inner">
            <Flame className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-600">Loading…</p>
      </div>
    </div>
  )
}
