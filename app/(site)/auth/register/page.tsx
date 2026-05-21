
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StarburstLogo from '@/components/ui/StarburstLogo'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <StarburstLogo size={64} color="#C9A870" className="mx-auto mb-6" />
          <h2 className="font-display font-extrabold text-3xl tracking-wider uppercase text-cream mb-4">
            ¡Bienvenido a Archivo Vivo!
          </h2>
          <p className="font-body text-cream/50 text-sm leading-relaxed mb-8">
            Te enviamos un enlace de confirmación a <strong className="text-cream">{email}</strong>.
            Por favor verifica tu correo para activar tu cuenta.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex font-display font-bold text-sm tracking-widest uppercase bg-cream text-dark px-8 py-3.5 hover:bg-gold transition-colors duration-300"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 border-r border-cream/5">
        <StarburstLogo size={80} color="#FAF5F0" className="mb-8" />
        <h1 className="font-display font-extrabold text-5xl tracking-widest uppercase text-cream mb-3">
          Archivo Vivo
        </h1>
        <p className="font-display font-bold text-xl tracking-[0.3em] uppercase text-gold">
          Ideas · Visión · Legado
        </p>
        <div className="mt-12 border border-cream/10 p-6 max-w-xs w-full">
          <p className="font-body text-xs text-cream/40 tracking-widest uppercase mb-3">Al registrarte obtienes</p>
          <ul className="space-y-2">
            {[
              'Puntos por cada compra',
              'Acceso a preventa exclusiva',
              'Historial de pedidos',
              'Notificaciones de proyectos',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-gold text-xs">★</span>
                <span className="font-body text-sm text-cream/60">{item}</span>
              </li>
            ))}
          </ul>
        </div>
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
            Crear Cuenta
          </h2>
          <p className="font-body text-cream/40 text-sm mb-10">
            Únete al archivo. Gana puntos. Vive el arte.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block font-body text-xs tracking-widest uppercase text-cream/40 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-cream/5 border border-cream/10 text-cream placeholder-cream/20 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors duration-200"
                placeholder="Tu nombre"
              />
            </div>
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
                minLength={6}
                className="w-full bg-cream/5 border border-cream/10 text-cream placeholder-cream/20 font-body text-sm px-4 py-3 focus:outline-none focus:border-gold transition-colors duration-200"
                placeholder="Mínimo 6 caracteres"
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
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="font-body text-sm text-cream/30 mt-8 text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-gold hover:text-cream transition-colors duration-200">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
