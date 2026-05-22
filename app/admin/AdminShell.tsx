'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/admin',           label: 'Dashboard',     icon: '◈' },
  { href: '/admin/cms',       label: 'Contenido',     icon: '✎' },
  { href: '/admin/orders',    label: 'Pedidos',       icon: '≡' },
  { href: '/admin/films',     label: 'Cortometrajes', icon: '▷' },
  { href: '/admin/merch',     label: 'Productos',     icon: '◻' },
  { href: '/admin/analytics', label: 'Analíticas',    icon: '▦' },
]

const ADMIN_NAV = [
  { href: '/admin/employees', label: 'Equipo',        icon: '◉' },
  { href: '/admin/settings',  label: 'Configuración', icon: '⚙' },
]

export default function AdminShell({ children, isAdmin }: { children: React.ReactNode; isAdmin: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isCMS = pathname === '/admin/cms'

  function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
    const exact = href === '/admin'
    const active = exact ? pathname === href : pathname.startsWith(href)
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          marginBottom: 2,
          background: active ? 'rgba(201,168,112,0.12)' : 'transparent',
          borderLeft: `2px solid ${active ? '#C9A870' : 'transparent'}`,
          color: active ? '#1a1815' : 'rgba(52,49,51,0.5)',
          textDecoration: 'none',
          fontSize: 12,
          fontWeight: active ? 600 : 400,
          letterSpacing: '0.04em',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 13, color: active ? '#C9A870' : 'rgba(52,49,51,0.3)', width: 16 }}>{icon}</span>
        {label}
      </Link>
    )
  }

  return (
    <div className="av-admin-root" style={{ display: 'flex', minHeight: '100vh', background: '#F7F4F1' }}>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,21,0.45)', zIndex: 39 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`av-sidebar${open ? ' is-open' : ''}`}>
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid rgba(52,49,51,0.07)' }}>
          <p style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.3)', margin: '0 0 2px' }}>
            Archivo Vivo
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1815', margin: 0 }}>Admin</p>
        </div>

        <nav style={{ padding: '8px 0', flex: 1 }}>
          {NAV.map(n => <NavLink key={n.href} {...n} />)}
          {isAdmin && (
            <>
              <div style={{ height: 1, background: 'rgba(52,49,51,0.07)', margin: '10px 14px' }} />
              {ADMIN_NAV.map(n => <NavLink key={n.href} {...n} />)}
            </>
          )}
        </nav>

        <button
          className="av-sidebar-x"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >×</button>
      </aside>

      {/* Main */}
      <div className="av-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header className="av-mob-header">
          <button className="av-hamburger" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <span /><span /><span />
          </button>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1815' }}>
            Admin
          </span>
          <div style={{ width: 28 }} />
        </header>

        <main style={{ flex: 1, overflow: isCMS ? 'hidden' : 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        .av-sidebar {
          width: 200px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid rgba(52,49,51,0.08);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 40;
        }
        .av-sidebar-x {
          display: none;
          position: absolute;
          top: 10px; right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(52,49,51,0.5);
          font-size: 20px;
          line-height: 1;
          padding: 4px;
        }
        .av-mob-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 48px;
          background: #fff;
          border-bottom: 1px solid rgba(52,49,51,0.08);
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .av-hamburger {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .av-hamburger span {
          display: block;
          width: 20px;
          height: 1.5px;
          background: #1a1815;
        }
        @media (max-width: 767px) {
          .av-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
          }
          .av-sidebar.is-open {
            transform: translateX(0);
          }
          .av-sidebar-x { display: block; }
          .av-mob-header { display: flex; }
          .av-main { margin-left: 0 !important; }
        }
        @media (min-width: 768px) {
          .av-main { margin-left: 200px; }
        }
        .av-admin-root {
          --f-display: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, system-ui, sans-serif;
          --f-sans:    -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, system-ui, sans-serif;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, system-ui, sans-serif;
        }
      `}</style>
    </div>
  )
}
