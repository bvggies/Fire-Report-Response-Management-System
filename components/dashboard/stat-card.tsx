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
  compact?: boolean
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

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay = 0,
  subtitle,
  compact = false,
}: StatCardProps) {
  const styles = accentStyles[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex h-full min-w-0 flex-col rounded-2xl border bg-gradient-to-br shadow-sm transition-shadow hover:shadow-md',
        compact ? 'p-4' : 'p-5 md:p-6',
        styles.card
      )}
    >
      <div
        className={cn(
          'mb-3 flex shrink-0 items-center justify-center rounded-xl',
          compact ? 'h-9 w-9' : 'h-10 w-10',
          styles.icon
        )}
      >
        <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
      </div>

      <p
        className={cn(
          'mb-1 text-[10px] font-semibold uppercase leading-snug tracking-wide sm:text-xs',
          styles.label
        )}
      >
        {label}
      </p>

      <p
        className={cn(
          'break-words text-xl font-bold leading-tight tracking-tight sm:text-2xl',
          !compact && 'md:text-3xl',
          styles.value
        )}
      >
        {value}
      </p>

      {subtitle && (
        <p className="mt-1.5 text-[11px] leading-snug text-slate-500 sm:text-xs">{subtitle}</p>
      )}
    </motion.div>
  )
}
