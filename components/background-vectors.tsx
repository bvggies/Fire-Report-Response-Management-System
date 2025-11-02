'use client'

import { motion } from 'framer-motion'

export function BackgroundVectors() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated circles */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-40 right-20 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, -30, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-80 h-80 bg-yellow-200 rounded-full blur-3xl opacity-20"
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Decorative lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M0 450 Q360 400 720 450 T1440 450"
          stroke="rgba(239, 68, 68, 0.1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>
    </div>
  )
}
