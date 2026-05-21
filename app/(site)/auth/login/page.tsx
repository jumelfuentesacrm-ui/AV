'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StarburstLogo from '@/components/ui/StarburstLogo'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/account'
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block font-body text-xs tracking-widest uppercase text-cream/40 mb-2">
          Correo Electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-cream/5 border border-cream/10 text-cream placeholder-cream/20 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors duration-200"
          placeholder="tu@correo.com"
        />
      </div>
      <div>
        <label className="block font-body text-xs tracking-widest uppercase text-cream/40 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-cream/5 border border-cream/10 text-cream placeholder-cream/20 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors duration-200"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="font-body text-sm text-red-400 bg-red-900/20 border border-red-900/30 px-4 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cream text-dark font-display font-bold text-sm tracking-widest uppercase py-4 hover:bg-gold transition-colors duration-300 disabled:opacity-60"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 border-r border-cream/5">
        <StarburstLogo size={80} color="#FAF5F0" className="mb-8" />
        <h1 className="font-display font-extrabold text-5xl tracking-widest uppercase text-cream mb-3">
          Archivo Vivo
        </h1>
        <p className="font-display font-bold text-xl tracking-[0.3em] uppercase text-gold">
          Ideas · Visión · Legado
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-12">
            <StarburstLogo size={48} color="#FAF5F0" className="mb-4" />
            <h1 className="font-display font-extrabold text-3xl tracking-widest uppercase text-cream">
              Archivo Vivo
            </h1>
          </div>

          <h2 className="font-display font-extrabold text-3xl tracking-wider uppercase text-cream mb-2">
            Iniciar Sesión
          </h2>
          <p className="font-body text-cream/40 text-sm mb-10">
            Accede a tu cuenta para ver tus puntos y pedidos.
          </p>

          <Suspense fallback={
            <div className="space-y-5 animate-pulse">
              <div className="h-12 bg-cream/5 border border-cream/10" />
              <div className="h-12 bg-cream/5 border border-cream/10" />
              <div className="h-12 bg-cream/10" />
            </div>
          }>
            <LoginForm />
          </Suspense>

          <p className="font-body text-sm text-cream/30 mt-8 text-center">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-gold hover:text-cream transition-colors duration-200">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
