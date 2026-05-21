import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StarburstLogo from '@/components/ui/StarburstLogo'
import type { Profile, PointsLedgerEntry, Order } from '@/types'

const TIER_THRESHOLDS = [
  { name: 'Archivo', min: 0, max: 100, color: 'text-charcoal/50' },
  { name: 'Plata', min: 100, max: 500, color: 'text-charcoal/70' },
  { name: 'Oro', min: 500, max: 2000, color: 'text-gold' },
  { name: 'Legado', min: 2000, max: Infinity, color: 'text-gold font-extrabold' },
]

function getTier(points: number) {
  return TIER_THRESHOLDS.find((t) => points >= t.min && points < t.max) ?? TIER_THRESHOLDS[0]
}

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/account')

  const [{ data: profileData }, { data: ledgerData }, { data: ordersData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('points_ledger').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const profile = profileData as Profile
  const ledger = (ledgerData as PointsLedgerEntry[]) ?? []
  const orders = (ordersData as Order[]) ?? []
  const tier = getTier(profile?.points_balance ?? 0)

  const handleSignOut = async () => {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <>
      <div className="min-h-screen bg-cream pt-20">
        {/* Header */}
        <div className="bg-dark py-16 px-6">
          <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="font-body text-xs text-cream/30 tracking-widest uppercase mb-2">Mi Cuenta</p>
              <h1 className="font-display font-extrabold text-cream text-4xl md:text-5xl tracking-wider uppercase">
                {profile?.full_name ?? user.email?.split('@')[0] ?? 'Usuario'}
              </h1>
              <p className="font-body text-cream/40 text-sm mt-1">{user.email}</p>
            </div>
            {/* Points hero */}
            <div className="bg-cream/5 border border-cream/10 px-8 py-6 text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-gold text-lg">★</span>
                <span className="font-display font-extrabold text-4xl text-cream">
                  {(profile?.points_balance ?? 0).toFixed(0)}
                </span>
              </div>
              <p className="font-body text-xs text-cream/30 tracking-widest uppercase">Puntos Disponibles</p>
              <p className={`font-display font-bold text-sm tracking-wider uppercase mt-1 ${tier.color}`}>
                Nivel: {tier.name}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: Profile + Tier */}
            <div className="lg:col-span-1 space-y-6">
              {/* Loyalty Tier */}
              <div className="border border-charcoal/10 p-6">
                <h3 className="font-display font-bold text-lg tracking-wider uppercase mb-4">Nivel de Lealtad</h3>
                <div className="space-y-3">
                  {TIER_THRESHOLDS.map((t) => {
                    const isActive = profile?.points_balance >= t.min && (profile?.points_balance < t.max || t.max === Infinity)
                    return (
                      <div key={t.name} className={`flex items-center justify-between py-2 border-b border-charcoal/5 last:border-0 ${isActive ? '' : 'opacity-30'}`}>
                        <div className="flex items-center gap-2">
                          {isActive && <StarburstLogo size={12} color="#C9A870" />}
                          <span className={`font-display font-bold text-sm tracking-wider uppercase ${isActive ? 'text-charcoal' : 'text-charcoal/40'}`}>
                            {t.name}
                          </span>
                        </div>
                        <span className="font-body text-xs text-charcoal/40">
                          {t.max === Infinity ? `${t.min}+ pts` : `${t.min}–${t.max} pts`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Profile info */}
              <div className="border border-charcoal/10 p-6">
                <h3 className="font-display font-bold text-lg tracking-wider uppercase mb-4">Perfil</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="font-body text-xs text-charcoal/40 tracking-widest uppercase">Nombre</dt>
                    <dd className="font-body text-sm text-charcoal">{profile?.full_name ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-body text-xs text-charcoal/40 tracking-widest uppercase">Correo</dt>
                    <dd className="font-body text-sm text-charcoal">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="font-body text-xs text-charcoal/40 tracking-widest uppercase">Miembro desde</dt>
                    <dd className="font-body text-sm text-charcoal">
                      {new Date(profile?.created_at ?? '').toLocaleDateString('es-PR', {
                        year: 'numeric', month: 'long',
                      })}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Sign out */}
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="w-full border border-charcoal/20 font-display font-bold text-xs tracking-widest uppercase py-3 hover:border-charcoal hover:bg-charcoal hover:text-cream transition-all duration-200"
                >
                  Cerrar Sesión
                </button>
              </form>
            </div>

            {/* Right: Orders + Points Ledger */}
            <div className="lg:col-span-2 space-y-10">

              {/* Orders */}
              <div>
                <h2 className="font-display font-bold text-2xl tracking-wider uppercase mb-6">
                  Mis Pedidos
                </h2>
                {orders.length === 0 ? (
                  <div className="border border-charcoal/10 py-12 text-center">
                    <p className="font-body text-sm text-charcoal/40">Aún no tienes pedidos.</p>
                    <Link href="/merch" className="inline-block mt-3 font-display font-bold text-xs tracking-widest uppercase text-gold hover:text-charcoal transition-colors duration-200">
                      Explorar Colección →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const statusMap: Record<string, string> = {
                        pending: 'Pendiente',
                        confirmed: 'Confirmado',
                        shipped: 'Enviado',
                        delivered: 'Entregado',
                        cancelled: 'Cancelado',
                      }
                      const statusColor: Record<string, string> = {
                        pending: 'text-gold',
                        confirmed: 'text-green-500',
                        shipped: 'text-blue-400',
                        delivered: 'text-charcoal/60',
                        cancelled: 'text-red-400',
                      }
                      return (
                        <div key={order.id} className="border border-charcoal/10 p-5 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-body text-xs text-charcoal/40 tracking-widest uppercase mb-0.5">
                              Orden #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="font-body text-xs text-charcoal/40">
                              {new Date(order.created_at).toLocaleDateString('es-PR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-body font-medium text-charcoal">${order.total.toFixed(2)}</p>
                            <p className={`font-display font-bold text-xs tracking-wider uppercase ${statusColor[order.status]}`}>
                              {statusMap[order.status]}
                            </p>
                          </div>
                          {order.points_earned > 0 && (
                            <div className="text-right hidden sm:block">
                              <span className="text-gold text-xs">★ +{order.points_earned.toFixed(2)} pts</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Points Ledger */}
              <div>
                <h2 className="font-display font-bold text-2xl tracking-wider uppercase mb-6">
                  Historial de Puntos
                </h2>
                {ledger.length === 0 ? (
                  <div className="border border-charcoal/10 py-12 text-center">
                    <p className="font-body text-sm text-charcoal/40">Sin movimientos de puntos aún.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-charcoal/5 border border-charcoal/10">
                    {ledger.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between px-5 py-4 gap-4">
                        <div>
                          <p className="font-body text-sm text-charcoal">{entry.description ?? 'Ajuste de puntos'}</p>
                          <p className="font-body text-xs text-charcoal/40 mt-0.5">
                            {new Date(entry.created_at).toLocaleDateString('es-PR', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className={`font-display font-bold text-lg tracking-wider ${entry.amount >= 0 ? 'text-gold' : 'text-red-400'}`}>
                          {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
