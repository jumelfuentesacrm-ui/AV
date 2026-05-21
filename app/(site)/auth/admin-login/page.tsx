'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') ?? '/admin'
  const hasError     = searchParams.get('error') === '1'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(hasError ? 'No tienes acceso al archivo.' : null)
  const supabase     = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Las puertas del archivo permanecen cerradas.')
        setLoading(false)
      } else {
        window.location.href = '/admin'
      }
    } catch (err: any) {
      setError(err?.message ?? 'Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 360 }}>
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(242,231,223,0.3)', marginBottom: 10 }}>
          Correo
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          style={{ width: '100%', background: 'rgba(242,231,223,0.04)', border: '1px solid rgba(242,231,223,0.1)', color: 'var(--av-cream)', fontFamily: 'var(--f-sans)', fontSize: 14, padding: '13px 16px', outline: 'none', transition: 'border-color 0.2s' }}
          placeholder="correo@archivovivo.com"
          onFocus={e => e.target.style.borderColor = 'rgba(242,231,223,0.3)'}
          onBlur={e => e.target.style.borderColor = 'rgba(242,231,223,0.1)'}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(242,231,223,0.3)', marginBottom: 10 }}>
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', background: 'rgba(242,231,223,0.04)', border: '1px solid rgba(242,231,223,0.1)', color: 'var(--av-cream)', fontFamily: 'var(--f-sans)', fontSize: 14, padding: '13px 16px', outline: 'none', transition: 'border-color 0.2s' }}
          placeholder="••••••••••••"
          onFocus={e => e.target.style.borderColor = 'rgba(242,231,223,0.3)'}
          onBlur={e => e.target.style.borderColor = 'rgba(242,231,223,0.1)'}
        />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(198,74,59,0.9)', background: 'rgba(198,74,59,0.08)', border: '1px solid rgba(198,74,59,0.15)', padding: '10px 14px', textTransform: 'uppercase' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ width: '100%', background: 'transparent', color: 'var(--av-cream)', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', padding: '16px', cursor: loading ? 'not-allowed' : 'pointer', border: '1px solid rgba(242,231,223,0.2)', transition: 'border-color 0.3s, background 0.3s', opacity: loading ? 0.5 : 1 }}
        onMouseEnter={e => { if (!loading) { (e.target as HTMLButtonElement).style.borderColor = 'rgba(242,231,223,0.6)'; (e.target as HTMLButtonElement).style.background = 'rgba(242,231,223,0.05)' } }}
        onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = 'rgba(242,231,223,0.2)'; (e.target as HTMLButtonElement).style.background = 'transparent' }}
      >
        {loading ? 'Verificando...' : 'Abrir el archivo →'}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--av-black)',
      color: 'var(--av-cream)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Subtle sunburst background */}
      <div className="sunburst-cream" style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        opacity: 0.03,
        pointerEvents: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      {/* Top label */}
      <p style={{
        position: 'absolute', top: 32, left: 0, right: 0, textAlign: 'center',
        fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.4em',
        textTransform: 'uppercase', color: 'rgba(242,231,223,0.15)',
      }}>
        Archivo Vivo · Acceso Restringido
      </p>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, width: '100%', maxWidth: 360 }}>

        {/* Headline */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(242,231,223,0.25)',
            marginBottom: 20,
          }}>
            ¿Conoces los secretos archivados?
          </p>
          <h1 className="wordmark" style={{
            fontSize: 'clamp(42px, 7vw, 72px)',
            color: 'var(--av-cream)',
            lineHeight: 0.88,
          }}>
            Archivo<br />Vivo
          </h1>
        </div>

        {/* Form */}
        <Suspense fallback={<div style={{ height: 200 }} />}>
          <AdminLoginForm />
        </Suspense>

      </div>

      {/* Bottom label */}
      <p style={{
        position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center',
        fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'rgba(242,231,223,0.1)',
      }}>
        Solo administradores y empleados
      </p>

    </div>
  )
}
