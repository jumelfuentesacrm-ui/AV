'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SECTIONS = [
  { id: 'top',          dark: false },
  { id: 'manifiesto',   dark: false },
  { id: 'episodios',    dark: true  },
  { id: 'indumentaria', dark: false },
  { id: 'maquinas',     dark: true  },
  { id: 'suscripcion',  dark: false },
  { id: 'contacto',     dark: true  },
]

type UserState = { name: string; role: string } | null

export default function Nav() {
  const navRef  = useRef<HTMLElement>(null)
  const router  = useRouter()
  const [user, setUser] = useState<UserState>(null)
  const supabase = createClient()

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    function updateNav() {
      if (!nav) return
      const y = window.scrollY
      nav.classList.toggle('is-stuck', y > 80)
      const probe = y + 110
      let cur = SECTIONS[0]
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (!el) continue
        if (el.offsetTop <= probe) cur = s
      }
      nav.classList.toggle('is-dark', cur.dark)
      nav.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((a) => {
        a.classList.toggle('active', a.dataset.link === cur.id)
      })
    }
    window.addEventListener('scroll', updateNav, { passive: true })
    updateNav()
    return () => window.removeEventListener('scroll', updateNav)
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setUser(null); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, email')
        .eq('id', authUser.id)
        .single()
      const name = profile?.full_name || authUser.email?.split('@')[0] || 'Usuario'
      setUser({ name, role: profile?.role ?? 'customer' })
    }
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'employee'
  const destination = isAdmin ? '/admin' : '/account'

  return (
    <nav className="nav" id="nav" ref={navRef}>
      <div className="nav-left">
        <a href="#episodios"    data-link="episodios">El Archivo</a>
        <a href="#indumentaria" data-link="indumentaria">Indumentaria</a>
        <a href="#maquinas"     data-link="maquinas">Máquinas</a>
      </div>

      <a href="#top" className="nav-mark">
        <span className="nav-mark-text">Archivo Vivo</span>
      </a>

      <div className="nav-right">
        <a href="#manifiesto" className="nav-manifiesto" data-link="manifiesto">Manifiesto</a>

        {user ? (
          <>
            <Link href={destination} className="nav-login">
              {user.name}
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--f-mono)', fontSize: 10,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--av-gray)', opacity: 0.7, padding: '0 4px',
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link href="/auth/login" className="nav-login">Log In</Link>
        )}

        <a href="#" className="nav-lang">ES&nbsp;/&nbsp;EN</a>
      </div>

      <div className="nav-mobile">
        <a href="#episodios">El Archivo</a>
        <a href="#indumentaria">Indumentaria</a>
        <a href="#maquinas">Máquinas</a>
        <a href="#manifiesto">Manifiesto</a>
        <a href="#suscripcion">Suscripción</a>
        {user ? (
          <>
            <Link href={destination}>{user.name}</Link>
            <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>
              Salir
            </button>
          </>
        ) : (
          <Link href="/auth/login">Log In</Link>
        )}

      </div>
    </nav>
  )
}
