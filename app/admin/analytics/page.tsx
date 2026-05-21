import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = createClient()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000).toISOString()

  const [ordersRes, newUsersRes, topProductsRes, statusBreakdownRes] = await Promise.all([
    supabase.from('orders').select('id, total, status, created_at').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id').gte('created_at', thirtyDaysAgo),
    supabase.from('order_items').select('product_id, quantity, unit_price, product:products(name)'),
    supabase.from('orders').select('status'),
  ])

  const orders     = ordersRes.data ?? []
  const newUsers   = newUsersRes.data ?? []
  const orderItems = topProductsRes.data ?? []
  const statuses   = statusBreakdownRes.data ?? []

  // Revenue calculations
  const totalRevenue30d = orders.reduce((s, o) => s + (o.total ?? 0), 0)
  const orders7d  = orders.filter(o => o.created_at >= sevenDaysAgo)
  const revenue7d = orders7d.reduce((s, o) => s + (o.total ?? 0), 0)

  // Status breakdown
  const statusCount: Record<string, number> = {}
  statuses.forEach(o => { statusCount[o.status] = (statusCount[o.status] ?? 0) + 1 })

  // Top products
  const productRevenue: Record<string, { name: string; revenue: number; qty: number }> = {}
  orderItems.forEach((item: any) => {
    const pid = item.product_id
    if (!productRevenue[pid]) productRevenue[pid] = { name: item.product?.name ?? pid, revenue: 0, qty: 0 }
    productRevenue[pid].revenue += (item.unit_price ?? 0) * (item.quantity ?? 0)
    productRevenue[pid].qty     += item.quantity ?? 0
  })
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  const cell: React.CSSProperties = { padding: '10px 14px', fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--av-ink)', borderBottom: '1px solid rgba(52,49,51,0.1)' }
  const head: React.CSSProperties = { ...cell, fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-gray)', background: 'rgba(52,49,51,0.04)' }

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px)', minHeight: '100vh' }}>
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-gray)' }}>Admin · Analíticas</span>
        <h1 className="wordmark" style={{ fontSize: 'clamp(32px,4vw,52px)', marginTop: 8, color: 'var(--av-ink)' }}>Analíticas</h1>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Ingresos (30d)', value: `$${totalRevenue30d.toFixed(2)}` },
          { label: 'Ingresos (7d)',  value: `$${revenue7d.toFixed(2)}` },
          { label: 'Pedidos (30d)', value: String(orders.length) },
          { label: 'Usuarios nuevos (30d)', value: String(newUsers.length) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'white', border: '1px solid rgba(52,49,51,0.12)', padding: '20px 22px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--av-gray)', marginBottom: 8 }}>{label}</div>
            <div className="wordmark" style={{ fontSize: 28 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Top Products */}
        <div style={{ background: 'white', border: '1px solid rgba(52,49,51,0.12)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(52,49,51,0.1)' }}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 18, textTransform: 'uppercase', color: 'var(--av-ink)' }}>Top Productos</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...head, textAlign: 'left' }}>Producto</th>
                <th style={{ ...head, textAlign: 'right' }}>Unidades</th>
                <th style={{ ...head, textAlign: 'right' }}>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={3} style={{ ...cell, color: 'var(--av-gray)', textAlign: 'center', padding: 32 }}>Sin datos</td></tr>
              ) : topProducts.map((p, i) => (
                <tr key={i}>
                  <td style={cell}>{p.name}</td>
                  <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--f-mono)' }}>{p.qty}</td>
                  <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--f-mono)' }}>${p.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Status Breakdown */}
        <div style={{ background: 'white', border: '1px solid rgba(52,49,51,0.12)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(52,49,51,0.1)' }}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 18, textTransform: 'uppercase', color: 'var(--av-ink)' }}>Estado de Pedidos</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...head, textAlign: 'left' }}>Estado</th>
                <th style={{ ...head, textAlign: 'right' }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statusCount).length === 0 ? (
                <tr><td colSpan={2} style={{ ...cell, color: 'var(--av-gray)', textAlign: 'center', padding: 32 }}>Sin datos</td></tr>
              ) : Object.entries(statusCount).map(([status, count]) => (
                <tr key={status}>
                  <td style={cell}>{status}</td>
                  <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--f-mono)' }}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'white', border: '1px solid rgba(52,49,51,0.12)', gridColumn: '1 / -1' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(52,49,51,0.1)' }}>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 18, textTransform: 'uppercase', color: 'var(--av-ink)' }}>Pedidos Recientes (30d)</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...head, textAlign: 'left' }}>ID</th>
                <th style={{ ...head, textAlign: 'left' }}>Fecha</th>
                <th style={{ ...head, textAlign: 'left' }}>Estado</th>
                <th style={{ ...head, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={4} style={{ ...cell, color: 'var(--av-gray)', textAlign: 'center', padding: 32 }}>Sin pedidos en los últimos 30 días</td></tr>
              ) : orders.slice(0, 20).map((o) => (
                <tr key={o.id}>
                  <td style={{ ...cell, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--av-gray)' }}>{o.id.slice(0, 8)}…</td>
                  <td style={{ ...cell, fontFamily: 'var(--f-mono)', fontSize: 11 }}>{new Date(o.created_at).toLocaleDateString('es-PR')}</td>
                  <td style={cell}>{o.status}</td>
                  <td style={{ ...cell, textAlign: 'right', fontFamily: 'var(--f-mono)' }}>${o.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
