import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'
import Link from 'next/link'

async function getStats() {
  const supabase = createClient()

  const [
    { count: usersCount },
    { count: ordersCount },
    { count: filmsCount },
    { count: productsCount },
    { data: ordersData },
    { data: pointsData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('films').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('orders').select('total'),
    supabase.from('points_ledger').select('amount').gte('amount', 0),
  ])

  const revenue = (ordersData ?? []).reduce((sum: number, o: { total: number }) => sum + o.total, 0)
  const totalPoints = (pointsData ?? []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

  return {
    users: usersCount ?? 0,
    orders: ordersCount ?? 0,
    films: filmsCount ?? 0,
    products: productsCount ?? 0,
    revenue,
    totalPoints,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const cards = [
    { label: 'Usuarios', value: stats.users.toString(), href: '/admin/users', icon: '◉' },
    { label: 'Pedidos', value: stats.orders.toString(), href: '/admin/orders', icon: '≡' },
    { label: 'Ingresos', value: `$${stats.revenue.toFixed(2)}`, href: '/admin/orders', icon: '$' },
    { label: 'Puntos Emitidos', value: stats.totalPoints.toFixed(0), href: '/admin/users', icon: '★' },
    { label: 'Cortometrajes', value: stats.films.toString(), href: '/admin/films', icon: '▷' },
    { label: 'Productos Activos', value: stats.products.toString(), href: '/admin/merch', icon: '◻' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <StarburstLogo size={28} color="#C9A870" />
          <h1 className="font-display font-extrabold text-3xl tracking-wider uppercase text-charcoal">
            Dashboard
          </h1>
        </div>
        <p className="font-body text-sm text-charcoal/40">
          Bienvenido al panel de administración de Archivo Vivo.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {cards.map(({ label, value, href, icon }) => (
          <Link
            key={label}
            href={href}
            className="group bg-dark text-cream p-6 hover:bg-charcoal transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-gold/60 text-xl">{icon}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cream/20 group-hover:text-gold/40 transition-colors duration-200">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <p className="font-display font-extrabold text-3xl text-cream mb-1">{value}</p>
            <p className="font-body text-xs text-cream/40 tracking-widest uppercase">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-display font-bold text-xl tracking-wider uppercase text-charcoal mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { href: '/admin/films', label: 'Gestionar Cortometrajes', desc: 'Añadir, editar o eliminar proyectos' },
            { href: '/admin/merch', label: 'Gestionar Productos', desc: 'Inventario, precios y variantes' },
            { href: '/admin/machines', label: 'Gestionar Máquinas', desc: 'Ubicaciones y horarios' },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="group border border-charcoal/10 p-5 hover:border-gold/40 transition-colors duration-200"
            >
              <h3 className="font-display font-bold text-base tracking-wider uppercase text-charcoal group-hover:text-gold transition-colors duration-200 mb-1">
                {label}
              </h3>
              <p className="font-body text-xs text-charcoal/40">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
