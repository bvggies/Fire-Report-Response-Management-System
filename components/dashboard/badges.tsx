import { cn } from '@/lib/utils'

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    CRITICAL: 'bg-red-500/15 text-red-700 ring-red-500/20',
    HIGH: 'bg-orange-500/15 text-orange-700 ring-orange-500/20',
    MEDIUM: 'bg-amber-500/15 text-amber-800 ring-amber-500/20',
    LOW: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 md:text-xs',
        styles[severity] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
      )}
    >
      {severity}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ')
  const styles: Record<string, string> = {
    RESOLVED: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20',
    FALSE_ALARM: 'bg-slate-500/15 text-slate-600 ring-slate-500/20',
    IN_PROGRESS: 'bg-blue-500/15 text-blue-700 ring-blue-500/20',
    ON_WAY: 'bg-sky-500/15 text-sky-700 ring-sky-500/20',
    ARRIVED: 'bg-indigo-500/15 text-indigo-700 ring-indigo-500/20',
    DISPATCHED: 'bg-violet-500/15 text-violet-700 ring-violet-500/20',
    RECEIVED: 'bg-amber-500/15 text-amber-800 ring-amber-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 md:text-xs',
        styles[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
      )}
    >
      {label}
    </span>
  )
}
