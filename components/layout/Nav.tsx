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

export default function Nav() {
  const navRef  = useRef<HTMLElement>(null)
  const router  = useRouter()
  const [role, setRole]       = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(data?.role ?? 'customer')
      setLoading(false)
    }
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setRole(null)
    router.push('/')
    router.refresh()
  }

  const isAdmin = role === 'admin' || role === 'employee'

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

        {!loading && (
          role ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="nav-login" style={{ marginRight: 8 }}>
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="nav-login"
                style={{ background: 'none', cursor: 'pointer', border: '1px solid currentColor' }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="nav-login">Log In</Link>
          )
        )}

        <a href="#" className="nav-lang">ES&nbsp;/&nbsp;EN</a>
      </div>

      {/* Mobile nav row */}
      <div className="nav-mobile">
        <a href="#episodios">El Archivo</a>
        <a href="#indumentaria">Indumentaria</a>
        <a href="#maquinas">Máquinas</a>
        <a href="#manifiesto">Manifiesto</a>
        <a href="#suscripcion">Suscripción</a>
        {role ? (
          <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}>
            Salir
          </button>
        ) : (
          <Link href="/auth/login">Log In</Link>
        )}
      </div>
    </nav>
  )
}
