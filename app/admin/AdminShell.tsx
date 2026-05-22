'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/admin',            label: 'Dashboard',     icon: '◈' },
  { href: '/admin/cms',        label: 'Editor',        icon: '◧' },
  { href: '/admin/catalogs',   label: 'Catálogos',     icon: '▦' },
  { href: '/admin/films',      label: 'Cortometrajes', icon: '▷' },
  { href: '/admin/merch',      label: 'Productos',     icon: '◻' },
  { href: '/admin/orders',     label: 'Pedidos',       icon: '≡' },
  { href: '/admin/users',      label: 'Usuarios',      icon: '◉' },
  { href: '/admin/employees',  label: 'Empleados',     icon: '◎' },
  { href: '/admin/machines',   label: 'Máquinas',      icon: '⊡' },
  { href: '/admin/analytics',  label: 'Analíticas',    icon: '◈' },
  { href: '/admin/settings',   label: 'Configuración', icon: '⚙' },
]

export default function AdminShell({ children, isAdmin }: { children: React.ReactNode; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isCMS = pathname === '/admin/cms'
  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="av-admin-root">

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 38, backdropFilter: 'blur(3px)' }}
        />
      )}

      {/* Sidebar */}
      <aside className={`av-sidebar${open ? ' is-open' : ''}`}>
        <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(242,231,223,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-montserrat, Montserrat, system-ui)', fontWeight: 800, fontSize: 14, color: 'var(--av-cream)', letterSpacing: '0.02em', display: 'block', textTransform: 'uppercase' }}>Archivo Vivo</span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--av-gray)', display: 'block', marginTop: 3 }}>
              {isAdmin ? 'Admin' : 'Staff'}
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className="av-sidebar-x" aria-label="Cerrar">×</button>
        </div>

        <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
          {NAV.map(({ href, label, icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '9px 10px',
                  fontFamily: 'var(--font-montserrat, Montserrat, system-ui)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 12,
                  color: active ? 'rgba(242,231,223,0.95)' : 'rgba(242,231,223,0.4)',
                  background: active ? 'rgba(242,231,223,0.07)' : 'transparent',
                  borderRadius: 2,
                  textDecoration: 'none',
                  borderLeft: active ? '2px solid #C9A870' : '2px solid transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: active ? '#C9A870' : 'var(--av-taupe)', width: 16, textAlign: 'center', flexShrink: 0 }}>
                  {icon}
                </span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(242,231,223,0.07)' }}>
          <Link href="/" style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(242,231,223,0.22)', textDecoration: 'none' }}>
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="av-main-col">
        {/* Mobile header */}
        <header className="av-mob-header">
          <button onClick={() => setOpen(true)} className="av-hamburger" aria-label="Menú">
            <span /><span /><span />
          </button>
          <span style={{ fontFamily: 'var(--font-montserrat, Montserrat, system-ui)', fontWeight: 700, fontSize: 13, color: 'var(--av-cream)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Archivo Vivo</span>
          <div style={{ width: 36 }} />
        </header>

        <main style={{ flex: 1, overflow: isCMS ? 'hidden' : 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        .av-admin-root {
          min-height: 100vh;
          display: flex;
          background: #EDE9E4;
          overflow: hidden;
          font-family: var(--font-montserrat, 'Montserrat', system-ui, sans-serif);
          --f-display: var(--font-montserrat, 'Montserrat', system-ui, sans-serif);
          --f-sans:    var(--font-montserrat, 'Montserrat', system-ui, sans-serif);
        }
        .av-sidebar {
          width: 216px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #141210;
          border-right: 1px solid rgba(242,231,223,0.06);
        }
        .av-sidebar-x {
          display: none;
          background: none;
          border: none;
          color: rgba(242,231,223,0.3);
          font-size: 22px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1;
        }
        .av-main-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }
        .av-mob-header { display: none; }
        .av-hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 7px;
        }
        .av-hamburger span {
          display: block;
          width: 100%;
          height: 1.5px;
          background: rgba(242,231,223,0.6);
        }
        @media (max-width: 767px) {
          .av-sidebar {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            z-index: 40;
            transform: translateX(-100%);
            transition: transform 0.26s cubic-bezier(0.4,0,0.2,1);
            width: 256px;
          }
          .av-sidebar.is-open { transform: translateX(0); }
          .av-sidebar-x { display: flex !important; }
          .av-mob-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 14px;
            height: 52px;
            background: #141210;
            border-bottom: 1px solid rgba(242,231,223,0.07);
            flex-shrink: 0;
            position: sticky;
            top: 0;
            z-index: 20;
          }
        }
      `}</style>
    </div>
  )
}
