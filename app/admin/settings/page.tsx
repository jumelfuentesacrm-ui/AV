'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavLink { label: string; href: string }

export default function SettingsPage() {
  const [theme, setTheme] = useState({
    cream: '#f2e7df', ink: '#343133', black: '#1a1815',
    taupe: '#c8bfb9', gray: '#737373', white: '#ffffff',
  })
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { label: 'El Archivo',   href: '#episodios' },
    { label: 'Indumentaria', href: '#indumentaria' },
    { label: 'Máquinas',     href: '#maquinas' },
    { label: 'Manifiesto',   href: '#manifiesto' },
  ])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('site_settings').select('*')
      if (!data) return
      data.forEach((s) => {
        if (s.key === 'theme')     setTheme(s.value as typeof theme)
        if (s.key === 'nav_links') setNavLinks(s.value as NavLink[])
      })
    }
    load()
  }, [supabase])

  const save = async () => {
    setSaving(true)
    await Promise.all([
      supabase.from('site_settings').upsert({ key: 'theme',     value: theme,    updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('site_settings').upsert({ key: 'nav_links', value: navLinks, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle: React.CSSProperties = { background: 'white', border: '1px solid rgba(52,49,51,0.18)', fontFamily: 'var(--f-sans)', fontSize: 13, padding: '8px 12px', outline: 'none', width: '100%' }
  const label: React.CSSProperties = { fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase' as const, color: 'var(--av-gray)', marginBottom: 6, display: 'block' }
  const card: React.CSSProperties = { background: 'white', border: '1px solid rgba(52,49,51,0.12)', marginBottom: 24 }
  const cardHead: React.CSSProperties = { padding: '16px 20px', borderBottom: '1px solid rgba(52,49,51,0.1)' }
  const cardBody: React.CSSProperties = { padding: 20 }

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-gray)' }}>Admin · Configuración</span>
          <h1 className="wordmark" style={{ fontSize: 'clamp(32px,4vw,52px)', marginTop: 8, color: 'var(--av-ink)' }}>Configuración del sitio</h1>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{ background: 'var(--av-ink)', color: 'var(--av-cream)', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', padding: '12px 24px', border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
        >
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* Theme Colors */}
      <div style={card}>
        <div style={cardHead}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 18, textTransform: 'uppercase', color: 'var(--av-ink)' }}>Colores del tema</h2>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 12, color: 'var(--av-gray)', marginTop: 4 }}>
            Estos valores actualizan las variables CSS globales del sitio.
          </p>
        </div>
        <div style={{ ...cardBody, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
          {(Object.entries(theme) as [keyof typeof theme, string][]).map(([key, val]) => (
            <div key={key}>
              <span style={label}>--av-{key}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={val}
                  onChange={(e) => setTheme(t => ({ ...t, [key]: e.target.value }))}
                  style={{ width: 40, height: 36, border: '1px solid rgba(52,49,51,0.2)', cursor: 'pointer', padding: 2 }}
                />
                <input
                  type="text"
                  value={val}
                  onChange={(e) => setTheme(t => ({ ...t, [key]: e.target.value }))}
                  style={{ ...inputStyle, width: 'auto', flex: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav Links */}
      <div style={card}>
        <div style={cardHead}>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 18, textTransform: 'uppercase', color: 'var(--av-ink)' }}>Links de navegación</h2>
        </div>
        <div style={cardBody}>
          {navLinks.map((link, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
              <input
                type="text"
                value={link.label}
                onChange={(e) => setNavLinks(links => links.map((l, j) => j === i ? { ...l, label: e.target.value } : l))}
                placeholder="Etiqueta"
                style={inputStyle}
              />
              <input
                type="text"
                value={link.href}
                onChange={(e) => setNavLinks(links => links.map((l, j) => j === i ? { ...l, href: e.target.value } : l))}
                placeholder="URL o #anchor"
                style={inputStyle}
              />
              <button
                onClick={() => setNavLinks(links => links.filter((_, j) => j !== i))}
                style={{ padding: '8px 12px', border: '1px solid rgba(52,49,51,0.18)', background: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--av-gray)' }}
              >✕</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => { if (i === 0) return; const l = [...navLinks]; [l[i-1], l[i]] = [l[i], l[i-1]]; setNavLinks(l) }}
                  style={{ padding: '2px 6px', border: '1px solid rgba(52,49,51,0.14)', background: 'none', cursor: 'pointer', fontSize: 10 }}
                >↑</button>
                <button
                  onClick={() => { if (i === navLinks.length-1) return; const l = [...navLinks]; [l[i], l[i+1]] = [l[i+1], l[i]]; setNavLinks(l) }}
                  style={{ padding: '2px 6px', border: '1px solid rgba(52,49,51,0.14)', background: 'none', cursor: 'pointer', fontSize: 10 }}
                >↓</button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setNavLinks(links => [...links, { label: '', href: '' }])}
            style={{ marginTop: 8, padding: '9px 18px', border: '1px solid rgba(52,49,51,0.22)', background: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase' }}
          >
            + Agregar link
          </button>
        </div>
      </div>
    </div>
  )
}
