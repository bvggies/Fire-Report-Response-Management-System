'use client'

import { X } from 'lucide-react'
import { motion } from 'framer-motion'

type ModalProps = {
  title: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: 'md' | 'lg'
}

export function Modal({ title, onClose, children, maxWidth = 'md' }: ModalProps) {
  const widthClass = maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative w-full ${widthClass} rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

export const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 focus:border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20'

export const labelClassName = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'
