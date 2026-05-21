export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import DashboardClient, { type DashboardStats } from './DashboardClient'

async function getData() {
  const supabase = createServiceClient()
  const now = new Date()
  const d30   = new Date(now.getTime() -  30 * 86400000).toISOString()
  const d60   = new Date(now.getTime() -  60 * 86400000).toISOString()
  const d90   = new Date(now.getTime() -  90 * 86400000).toISOString()

  const [usersRes, productsRes, ordersAllRes, orders30Res, ordersPrev30Res, newUsers30Res, chartOrdersRes, ordersUsersRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total, created_at').gte('created_at', d30),
    supabase.from('orders').select('total').gte('created_at', d60).lt('created_at', d30),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', d30),
    supabase.from('orders').select('total, created_at').gte('created_at', d90),
    supabase.from('orders').select('user_id'),
  ])

  const orders30  = orders30Res.data  ?? []
  const chartOrds = chartOrdersRes.data ?? []
  const revenue30d     = orders30.reduce((s, o) => s + (o.total ?? 0), 0)
  const revenuePrev30d = (ordersPrev30Res.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0)
  const usersWithOrders = new Set((ordersUsersRes.data ?? []).map((o: { user_id: string }) => o.user_id)).size

  const stats: DashboardStats = {
    users:          usersRes.count    ?? 0,
    orders:         ordersAllRes.count ?? 0,
    products:       productsRes.count  ?? 0,
    revenue30d,
    revenuePrev30d,
    orders30d:      orders30.length,
    ordersPrev30d:  ordersPrev30Res.data?.length ?? 0,
    newUsers30d:    newUsers30Res.count ?? 0,
    usersWithOrders,
    aov:            orders30.length > 0 ? revenue30d / orders30.length : 0,
  }

  return { stats, chartOrders: chartOrds }
}

export default async function AdminDashboard() {
  const { stats, chartOrders } = await getData()
  return <DashboardClient stats={stats} chartOrders={chartOrders} />
}
