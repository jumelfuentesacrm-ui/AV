'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

interface AnimateInProps {
  children: ReactNode
  delay?: number
  y?: number
  blur?: boolean
  className?: string
  once?: boolean
}

export function AnimateIn({
  children,
  delay = 0,
  y = 36,
  blur = false,
  className = '',
  once = true,
}: AnimateInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: blur ? 'blur(12px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.75, ease, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimateStagger({
  children,
  className = '',
  staggerMs = 100,
}: {
  children: ReactNode[]
  className?: string
  staggerMs?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: staggerMs / 1000 } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
      }}
    >
      {children}
    </motion.div>
  )
}
