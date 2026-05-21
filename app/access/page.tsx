'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

function StarburstBg() {
  const spokes = Array.from({ length: 16 }, (_, i) => i)
  return (
    <svg
      viewBox="-60 -60 120 120"
      className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none select-none"
      style={{ transform: 'scale(1.1)' }}
      aria-hidden
    >
      {spokes.map((i) => (
        <rect
          key={i}
          x="-2"
          y="-52"
          width="4"
          height="34"
          rx="2"
          fill="#FAF5F0"
          transform={`rotate(${(360 / 16) * i})`}
        />
      ))}
    </svg>
  )
}

function StarburstIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  const spokes = Array.from({ length: 16 }, (_, i) => i)
  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      className={className}
      aria-hidden
    >
      {spokes.map((i) => (
        <rect
          key={i}
          x="-2"
          y="-52"
          width="4"
          height="34"
          rx="2"
          fill="#FAF5F0"
          transform={`rotate(${(360 / 16) * i})`}
        />
      ))}
    </svg>
  )
}

export default function AccessPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    const res = await fetch('/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      setUnlocked(true)
      setTimeout(() => router.push('/'), 1800)
    } else {
      setError(true)
      setLoading(false)
      setPassword('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="relative min-h-screen bg-[#1A1A18] flex flex-col items-center justify-center overflow-hidden">

      {/* Giant starburst background */}
      <StarburstBg />

      {/* Loading overlay */}
      {unlocked && (
        <div className="fixed inset-0 z-50 bg-[#1A1A18] flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-6">
            <StarburstIcon
              size={80}
              className="animate-spin-slow"
            />
            <p
              className="font-display font-extrabold tracking-[0.4em] uppercase text-[#FAF5F0] text-xs opacity-60"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              CARGANDO ARCHIVO
            </p>
          </div>
        </div>
      )}

      {/* Top wordmark */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <StarburstIcon size={20} />
        <span
          className="text-[#FAF5F0]/30 text-xs tracking-[0.35em] uppercase"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
        >
          ARCHIVO VIVO
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">

        <p
          className="text-[#FAF5F0]/20 text-[10px] tracking-[0.5em] uppercase mb-8"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          VOL. 0.1 — ACCESO BETA
        </p>

        <h1
          className="text-[#FAF5F0] leading-none mb-3"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 7vw, 3.5rem)',
            letterSpacing: '0.02em',
          }}
        >
          SI ESTÁS LEYENDO ESTO...
        </h1>
        <h2
          className="text-[#C9A870] leading-none mb-12"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(1.5rem, 5vw, 2.6rem)',
            letterSpacing: '0.02em',
          }}
        >
          MÍNIMO ERES LEYENDA.
        </h2>

        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            placeholder="Contraseña de acceso"
            autoFocus
            className={`w-full bg-white/5 border text-center text-[#FAF5F0] placeholder-white/20 text-sm tracking-widest px-4 py-4 focus:outline-none transition-colors duration-200 ${
              error ? 'border-red-500/60 animate-shake' : 'border-white/10 focus:border-[#C9A870]'
            }`}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.2em' }}
          />
          {error && (
            <p
              className="text-red-400/80 text-xs tracking-widest uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Acceso denegado.
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-[#FAF5F0] text-[#1A1A18] py-4 text-xs tracking-[0.3em] uppercase font-extrabold hover:bg-[#C9A870] transition-colors duration-300 disabled:opacity-40"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {loading ? '...' : 'ENTRAR'}
          </button>
        </form>
      </div>

      {/* Bottom label */}
      <p
        className="absolute bottom-8 text-[#FAF5F0]/15 text-[10px] tracking-[0.4em] uppercase"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        IDEAS · VISIÓN · LEGADO
      </p>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&display=swap');

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-spin-slow { animation: spin-slow 1.2s linear infinite; }
        .animate-fade-in { animation: fade-in 0.3s ease forwards; }
        .animate-shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  )
}
