'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  accent: 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'indigo' | 'amber'
  delay?: number
  subtitle?: string
}

const accentStyles = {
  red: {
    card: 'from-red-500/10 via-white to-white border-red-200/80',
    icon: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25',
    value: 'text-red-950',
    label: 'text-red-700/80',
  },
  orange: {
    card: 'from-orange-500/10 via-white to-white border-orange-200/80',
    icon: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25',
    value: 'text-orange-950',
    label: 'text-orange-700/80',
  },
  green: {
    card: 'from-emerald-500/10 via-white to-white border-emerald-200/80',
    icon: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25',
    value: 'text-emerald-950',
    label: 'text-emerald-700/80',
  },
  blue: {
    card: 'from-blue-500/10 via-white to-white border-blue-200/80',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25',
    value: 'text-blue-950',
    label: 'text-blue-700/80',
  },
  purple: {
    card: 'from-violet-500/10 via-white to-white border-violet-200/80',
    icon: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25',
    value: 'text-violet-950',
    label: 'text-violet-700/80',
  },
  indigo: {
    card: 'from-indigo-500/10 via-white to-white border-indigo-200/80',
    icon: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25',
    value: 'text-indigo-950',
    label: 'text-indigo-700/80',
  },
  amber: {
    card: 'from-amber-500/10 via-white to-white border-amber-200/80',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
    value: 'text-amber-950',
    label: 'text-amber-700/80',
  },
}

export function StatCard({ label, value, icon: Icon, accent, delay = 0, subtitle }: StatCardProps) {
  const styles = accentStyles[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-shadow hover:shadow-md md:p-6',
        styles.card
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-semibold uppercase tracking-wider md:text-sm', styles.label)}>
            {label}
          </p>
          <p className={cn('mt-2 text-2xl font-bold tracking-tight md:text-3xl', styles.value)}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12', styles.icon)}>
          <Icon className="h-5 w-5 md:h-6 md:w-6" />
        </div>
      </div>
    </motion.div>
  )
}
