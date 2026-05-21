export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const NAV_ITEMS = [
  { href: '/admin',            label: 'Dashboard',      icon: '◈' },
  { href: '/admin/cms',        label: 'Editor de página', icon: '◧' },
  { href: '/admin/catalogs',   label: 'Catálogos',      icon: '▦' },
  { href: '/admin/films',      label: 'Cortometrajes',  icon: '▷' },
  { href: '/admin/merch',      label: 'Productos',      icon: '◻' },
  { href: '/admin/orders',     label: 'Pedidos',        icon: '≡' },
  { href: '/admin/users',      label: 'Usuarios',       icon: '◉' },
  { href: '/admin/employees',  label: 'Empleados',      icon: '◎' },
  { href: '/admin/machines',   label: 'Máquinas',       icon: '⊡' },
  { href: '/admin/analytics',  label: 'Analíticas',     icon: '◈' },
  { href: '/admin/settings',   label: 'Configuración',  icon: '⚙' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'none'
  if (!['admin', 'employee'].includes(role)) redirect(`/auth/admin-login?error=1&role=${role}`)

  const isAdmin = profile.role === 'admin'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F0EBE5' }}>
      {/* Sidebar */}
      <aside style={{ width: 224, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--av-black)', borderRight: '1px solid rgba(242,231,223,0.06)' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(242,231,223,0.08)' }}>
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="wordmark" style={{ fontSize: 15, color: 'var(--av-cream)', letterSpacing: '0.02em' }}>Archivo Vivo</span>
          </Link>
          <span style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--av-gray)', marginTop: 6 }}>
            {isAdmin ? 'Admin Panel' : 'Employee Panel'}
          </span>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', fontFamily: 'var(--f-sans)', fontSize: 13, color: 'rgba(242,231,223,0.5)', borderRadius: 2, transition: 'color 0.2s, background 0.2s', textDecoration: 'none' }}
              className="admin-nav-link"
            >
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--av-taupe)', width: 16 }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(242,231,223,0.08)' }}>
          <Link
            href="/"
            style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--av-gray)', opacity: 0.7 }}
          >
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover { color: rgba(242,231,223,0.9) !important; background: rgba(242,231,223,0.05); }
      `}</style>
    </div>
  )
}
