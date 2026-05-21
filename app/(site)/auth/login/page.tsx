
'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') ?? '/account'
  const supabase     = createClient()

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
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-taupe)', marginBottom: 8 }}>
          Correo Electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', background: 'rgba(242,231,223,0.06)', border: '1px solid rgba(242,231,223,0.14)', color: 'var(--av-cream)', fontFamily: 'var(--f-sans)', fontSize: 15, padding: '12px 16px', outline: 'none' }}
          placeholder="tu@correo.com"
        />
      </div>
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-taupe)', marginBottom: 8 }}>
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', background: 'rgba(242,231,223,0.06)', border: '1px solid rgba(242,231,223,0.14)', color: 'var(--av-cream)', fontFamily: 'var(--f-sans)', fontSize: 15, padding: '12px 16px', outline: 'none' }}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.18em', color: '#c64a3b', background: 'rgba(198,74,59,0.1)', border: '1px solid rgba(198,74,59,0.2)', padding: '10px 14px' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ width: '100%', background: 'var(--av-cream)', color: 'var(--av-ink)', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '16px', cursor: 'pointer', border: 'none', transition: 'background 0.3s', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Entrando...' : 'Entrar →'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--av-black)', color: 'var(--av-cream)', display: 'flex' }}>
      {/* Left — brand panel */}
      <div style={{ display: 'none', flex: '0 0 50%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', borderRight: '1px solid rgba(242,231,223,0.06)' }} className="login-left">
        <div className="sunburst" style={{ width: 80, height: 80, marginBottom: 32, opacity: 0.6 }} />
        <h1 className="wordmark" style={{ fontSize: 'clamp(40px,5vw,72px)', color: 'var(--av-cream)', marginBottom: 12 }}>
          Archivo Vivo
        </h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--av-taupe)' }}>
          Ideas · Visión · Legado
        </p>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(24px,5vw,60px)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile brand */}
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <span className="wordmark" style={{ fontSize: 28, color: 'var(--av-cream)', display: 'block', marginBottom: 6 }}>Archivo Vivo</span>
            <span className="label" style={{ letterSpacing: '0.32em' }}>Ideas · Visión · Legado</span>
          </div>

          <h2 className="wordmark" style={{ fontSize: 'clamp(32px,4vw,48px)', color: 'var(--av-cream)', marginBottom: 8 }}>
            Iniciar Sesión
          </h2>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--av-taupe)', marginBottom: 36 }}>
            Accede a tu cuenta para ver tus puntos y pedidos.
          </p>

          <Suspense fallback={<div style={{ height: 160, background: 'rgba(242,231,223,0.04)' }} />}>
            <LoginForm />
          </Suspense>

          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--av-gray)', marginTop: 32, textAlign: 'center' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" style={{ color: 'var(--av-cream)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Regístrate aquí
            </Link>
          </p>

          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <Link href="/" style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-gray)', opacity: 0.6 }}>
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .login-left { display: flex !important; } }
      `}</style>
    </div>
  )
}
