import { createClient } from '@/lib/supabase/server'
import type { Order } from '@/types'

export const revalidate = 0

async function getOrders(): Promise<Order[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .order('created_at', { ascending: false })
  return (data as Order[]) ?? []
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gold/20 text-gold',
  confirmed: 'bg-green-100 text-green-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-charcoal/10 text-charcoal/50',
  cancelled: 'bg-red-100 text-red-600',
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-wider uppercase text-charcoal">
            Pedidos
          </h1>
          <p className="font-body text-sm text-charcoal/40 mt-1">
            {orders.length} pedidos · Ingresos totales: ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-charcoal/10">
          <p className="font-body text-charcoal/40">No hay pedidos aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10">
                {['Pedido', 'Usuario', 'Total', 'Puntos', 'Estado', 'Fecha'].map((h) => (
                  <th key={h} className="text-left font-body text-xs tracking-widest uppercase text-charcoal/40 pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-4 pr-4">
                    <p className="font-body text-xs font-medium tracking-widest uppercase">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </td>
                  <td className="py-4 pr-4 font-body text-xs text-charcoal/50">
                    {order.user_id.slice(0, 8)}...
                  </td>
                  <td className="py-4 pr-4 font-body text-sm font-medium">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-4 pr-4">
                    <span className="flex items-center gap-1 text-gold text-xs">
                      ★ {order.points_earned.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`font-display font-bold text-xs tracking-wider uppercase px-2 py-0.5 ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-body text-xs text-charcoal/50">
                    {new Date(order.created_at).toLocaleDateString('es-PR', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
