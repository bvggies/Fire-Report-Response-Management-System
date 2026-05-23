'use client'

import { motion } from 'framer-motion'

export const CHART_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

export const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.15)',
  fontSize: 13,
}

type ChartPanelProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  delay?: number
  className?: string
}

export function ChartPanel({ title, subtitle, children, delay = 0, className }: ChartPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6 ${className ?? ''}`}
    >
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 mb-4 text-xs text-slate-500">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </motion.div>
  )
}
