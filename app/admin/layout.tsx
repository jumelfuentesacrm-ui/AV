import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-[#F5F0EA] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-dark flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-cream/10">
          <Link href="/" className="flex items-center gap-2">
            <StarburstLogo size={24} color="#FAF5F0" />
            <span className="font-display font-bold text-sm tracking-widest uppercase text-cream">
              Archivo Vivo
            </span>
          </Link>
          <p className="font-body text-xs text-cream/30 tracking-widest uppercase mt-1 ml-8">Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard', icon: '◈' },
            { href: '/admin/films', label: 'Cortometrajes', icon: '▷' },
            { href: '/admin/merch', label: 'Productos', icon: '◻' },
            { href: '/admin/machines', label: 'Máquinas', icon: '⊡' },
            { href: '/admin/users', label: 'Usuarios', icon: '◉' },
            { href: '/admin/orders', label: 'Pedidos', icon: '≡' },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 font-body text-sm text-cream/50 hover:text-cream hover:bg-cream/5 transition-colors duration-200 rounded-sm"
            >
              <span className="text-gold/60 text-xs w-4">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-cream/10">
          <Link
            href="/"
            className="flex items-center gap-2 font-body text-xs text-cream/30 hover:text-cream/60 transition-colors duration-200 tracking-wider"
          >
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
