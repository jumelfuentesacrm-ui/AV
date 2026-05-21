'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

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
  const [profile, setProfile] = useState<Profile | null>(null)
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
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data as Profile)
    }
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [supabase])

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
        <Link href="/auth/login" className="nav-login">Log In</Link>
        <a href="#" className="nav-lang">ES&nbsp;/&nbsp;EN</a>
      </div>

      {/* Mobile nav row */}
      <div className="nav-mobile">
        <a href="#episodios">El Archivo</a>
        <a href="#indumentaria">Indumentaria</a>
        <a href="#maquinas">Máquinas</a>
        <a href="#manifiesto">Manifiesto</a>
        <a href="#suscripcion">Suscripción</a>
      </div>
    </nav>
  )
}
