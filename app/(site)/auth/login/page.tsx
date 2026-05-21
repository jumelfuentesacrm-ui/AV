'use client'

import { Suspense, useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from './actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') ?? ''
  const [state, formAction, pending] = useActionState(loginAction, { error: null })

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div>
        <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-taupe)', marginBottom: 8 }}>
          Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
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
          name="password"
          required
          style={{ width: '100%', background: 'rgba(242,231,223,0.06)', border: '1px solid rgba(242,231,223,0.14)', color: 'var(--av-cream)', fontFamily: 'var(--f-sans)', fontSize: 15, padding: '12px 16px', outline: 'none' }}
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.18em', color: '#c64a3b', background: 'rgba(198,74,59,0.1)', border: '1px solid rgba(198,74,59,0.2)', padding: '10px 14px' }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{ width: '100%', background: 'var(--av-cream)', color: 'var(--av-ink)', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '16px', cursor: pending ? 'not-allowed' : 'pointer', border: 'none', transition: 'background 0.3s', opacity: pending ? 0.6 : 1 }}
      >
        {pending ? 'Entrando...' : 'Entrar →'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--av-black)', color: 'var(--av-cream)', display: 'flex' }}>
      <div style={{ display: 'none', flex: '0 0 50%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', borderRight: '1px solid rgba(242,231,223,0.06)' }} className="login-left">
        <h1 className="wordmark" style={{ fontSize: 'clamp(40px,5vw,72px)', color: 'var(--av-cream)', marginBottom: 12 }}>
          Archivo Vivo
        </h1>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--av-taupe)' }}>
          Ideas · Visión · Legado
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(24px,5vw,60px)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <Link href="/auth/admin-login" style={{ textDecoration: 'none' }}>
              <span className="wordmark" style={{ fontSize: 28, color: 'var(--av-cream)', display: 'block', marginBottom: 6 }}>Archivo Vivo</span>
            </Link>
            <span className="label" style={{ letterSpacing: '0.32em' }}>Ideas · Visión · Legado</span>
          </div>

          <h2 className="wordmark" style={{ fontSize: 'clamp(32px,4vw,48px)', color: 'var(--av-cream)', marginBottom: 8 }}>
            Iniciar Sesión
          </h2>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--av-taupe)', marginBottom: 36 }}>
            Accede a tu cuenta para ver tus puntos y pedidos.
          </p>

          <Suspense fallback={<div style={{ height: 200, background: 'rgba(242,231,223,0.04)' }} />}>
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
