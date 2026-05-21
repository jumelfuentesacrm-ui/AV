'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import StarburstLogo from './StarburstLogo'

const ease = [0.16, 1, 0.3, 1] as const

export function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col items-center text-center px-6">
      {/* Starburst — scales in then keeps spinning */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.1, ease }}
        className="mb-8"
        style={{ animation: 'var(--spin-after)' }}
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
          <StarburstLogo size={120} color="#FAF5F0" />
        </motion.div>
      </motion.div>

      {/* Title — blur snap */}
      <motion.h1
        initial={{ opacity: 0, filter: 'blur(24px)', scale: 0.96 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.3 }}
        className="font-display font-extrabold text-cream leading-none tracking-widest uppercase mb-4"
        style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
      >
        Archivo Vivo
      </motion.h1>

      {/* Tagline — slides up */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.65 }}
        className="font-display font-bold text-gold tracking-[0.35em] uppercase text-lg md:text-2xl mb-10"
      >
        Ideas · Visión · Legado
      </motion.p>

      {/* Gold divider line — draws itself */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease, delay: 0.85 }}
        style={{ originX: 0 }}
        className="w-24 h-px bg-gold mb-10"
      />

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 1.0 }}
        className="flex items-center gap-4 flex-wrap justify-center"
      >
        <Link
          href="/films"
          className="bg-cream text-dark font-display font-bold text-sm tracking-widest uppercase px-8 py-3.5 hover:bg-gold hover:text-dark transition-colors duration-300"
        >
          Ver Cortometrajes
        </Link>
        <Link
          href="/merch"
          className="border border-cream/30 text-cream font-display font-bold text-sm tracking-widest uppercase px-8 py-3.5 hover:border-gold hover:text-gold transition-colors duration-300"
        >
          Explorar Ropa
        </Link>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="mt-20 flex flex-col items-center gap-2 text-cream/30"
      >
        <span className="font-body text-xs tracking-widest uppercase">Desplazar</span>
        <motion.div
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
          className="w-px h-12 bg-gradient-to-b from-cream/40 to-transparent"
        />
      </motion.div>
    </div>
  )
}
