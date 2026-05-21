'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import StarburstLogo from '@/components/ui/StarburstLogo'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data as Profile)
      }
    }
    getProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getProfile()
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cream border-b border-charcoal/10 shadow-sm'
          : 'bg-cream/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <StarburstLogo size={28} color="#2D2A28" className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-display font-extrabold text-lg tracking-widest uppercase text-charcoal">
            Archivo Vivo
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/films"
            className="font-body font-medium text-sm tracking-wider uppercase hover:text-gold transition-colors duration-200"
          >
            Cortometrajes
          </Link>
          <Link
            href="/merch"
            className="font-body font-medium text-sm tracking-wider uppercase hover:text-gold transition-colors duration-200"
          >
            Ropa
          </Link>
          <Link
            href="/machines"
            className="font-body font-medium text-sm tracking-wider uppercase hover:text-gold transition-colors duration-200"
          >
            Máquinas
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Points badge */}
          {profile && (
            <Link
              href="/account"
              className="hidden md:flex items-center gap-1.5 bg-dark text-cream px-3 py-1.5 text-xs font-body font-medium tracking-wider uppercase hover:bg-charcoal transition-colors duration-200"
            >
              <span className="text-gold">★</span>
              <span>{profile.points_balance.toFixed(0)} pts</span>
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/merch"
            className="relative p-1.5 hover:text-gold transition-colors duration-200"
            aria-label={`Carrito, ${itemCount} artículos`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-dark text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Account */}
          {profile ? (
            <Link
              href="/account"
              className="hidden md:flex p-1.5 hover:text-gold transition-colors duration-200"
              aria-label="Mi cuenta"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:inline-flex font-body font-medium text-sm tracking-wider uppercase border border-charcoal/30 px-4 py-1.5 hover:border-gold hover:text-gold transition-colors duration-200"
            >
              Entrar
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5"
            aria-label="Menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-charcoal/10 px-6 py-6 flex flex-col gap-5">
          <Link
            href="/films"
            onClick={() => setMenuOpen(false)}
            className="font-display font-extrabold text-2xl tracking-wider uppercase"
          >
            Cortometrajes
          </Link>
          <Link
            href="/merch"
            onClick={() => setMenuOpen(false)}
            className="font-display font-extrabold text-2xl tracking-wider uppercase"
          >
            Ropa
          </Link>
          <Link
            href="/machines"
            onClick={() => setMenuOpen(false)}
            className="font-display font-extrabold text-2xl tracking-wider uppercase"
          >
            Máquinas
          </Link>
          <div className="border-t border-charcoal/10 pt-4 flex items-center justify-between">
            {profile ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="font-body text-sm uppercase tracking-wider">
                  Mi Cuenta
                </Link>
                <span className="text-gold text-sm font-medium">★ {profile.points_balance.toFixed(0)} pts</span>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="font-body text-sm uppercase tracking-wider">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
