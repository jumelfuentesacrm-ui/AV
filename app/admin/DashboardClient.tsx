'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Period = 'daily' | 'weekly' | 'monthly'

interface Order { total: number; created_at: string }

export interface DashboardStats {
  users: number
  orders: number
  products: number
  revenue30d: number
  revenuePrev30d: number
  orders30d: number
  ordersPrev30d: number
  newUsers30d: number
  usersWithOrders: number
  aov: number
}

function pct(a: number, b: number) {
  if (b === 0) return null
  return ((a - b) / b) * 100
}

function fmt$(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`
}

function Trend({ val }: { val: number | null }) {
  if (val === null) return <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(52,49,51,0.3)', letterSpacing: '0.1em' }}>Sin datos anteriores</span>
  const up = val >= 0
  return (
    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', color: up ? '#2a6e44' : '#c64a3b' }}>
      {up ? '▲' : '▼'} {Math.abs(val).toFixed(1)}% vs periodo anterior
    </span>
  )
}

function KPI({ label, value, trend, sub, dark, muted }: {
  label: string; value: string; trend?: number | null; sub?: string; dark?: boolean; muted?: boolean
}) {
  return (
    <div style={{
      background: dark ? '#1a1815' : '#fff',
      border: dark ? 'none' : '1px solid rgba(52,49,51,0.1)',
      padding: '18px 20px',
    }}>
      <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: dark ? 'rgba(242,231,223,0.4)' : 'rgba(52,49,51,0.38)', margin: '0 0 10px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 28, color: dark ? '#FAF5F0' : muted ? 'rgba(52,49,51,0.22)' : '#1a1815', margin: '0 0 6px', lineHeight: 1 }}>
        {value}
      </p>
      {trend !== undefined && <Trend val={trend ?? null} />}
      {sub && !trend && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.1em', color: dark ? 'rgba(242,231,223,0.3)' : 'rgba(52,49,51,0.35)' }}>{sub}</span>}
    </div>
  )
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 100, paddingBottom: 24, position: 'relative' }}>
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * 100, d.value > 0 ? 2 : 0)
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
            <div
              title={`${d.label}: $${d.value.toFixed(2)}`}
              style={{
                width: '100%',
                height: `${h}%`,
                minHeight: d.value > 0 ? 3 : 0,
                background: d.value > 0 ? '#C9A870' : 'rgba(52,49,51,0.07)',
                borderRadius: '2px 2px 0 0',
              }}
            />
            <span style={{
              position: 'absolute',
              bottom: -20,
              fontFamily: 'monospace',
              fontSize: 8,
              color: 'rgba(52,49,51,0.35)',
              whiteSpace: 'nowrap',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardClient({ stats, chartOrders }: { stats: DashboardStats; chartOrders: Order[] }) {
  const [period, setPeriod] = useState<Period>('daily')

  const chartData = useMemo(() => {
    const now = new Date()
    if (period === 'daily') {
      return Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (13 - i))
        const dayStr = d.toISOString().split('T')[0]
        const value = chartOrders.filter(o => o.created_at.startsWith(dayStr)).reduce((s, o) => s + o.total, 0)
        return { label: d.toLocaleDateString('es-PR', { month: 'numeric', day: 'numeric' }), value }
      })
    }
    if (period === 'weekly') {
      return Array.from({ length: 8 }, (_, i) => {
        const end = new Date(now); end.setDate(end.getDate() - (7 - i - 1) * 7)
        const start = new Date(end); start.setDate(start.getDate() - 7)
        const value = chartOrders.filter(o => { const d = new Date(o.created_at); return d >= start && d <= end }).reduce((s, o) => s + o.total, 0)
        return { label: `S${i + 1}`, value }
      })
    }
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const value = chartOrders.filter(o => { const od = new Date(o.created_at); return od >= d && od < next }).reduce((s, o) => s + o.total, 0)
      return { label: d.toLocaleDateString('es-PR', { month: 'short' }), value }
    })
  }, [period, chartOrders])

  const chartTotal = chartData.reduce((s, d) => s + d.value, 0)
  const conversionRate = stats.users > 0 ? (stats.usersWithOrders / stats.users) * 100 : 0
  const revTrend = pct(stats.revenue30d, stats.revenuePrev30d)
  const ordTrend = pct(stats.orders30d, stats.ordersPrev30d)

  const periodLabel: Record<Period, string> = { daily: 'Últimos 14 días', weekly: 'Últimas 8 semanas', monthly: 'Últimos 6 meses' }

  return (
    <div style={{ padding: 'clamp(16px,4vw,40px)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.35)', margin: 0 }}>
          Archivo Vivo · Admin
        </p>
        <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 'clamp(22px,4vw,38px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1815', margin: '4px 0 0' }}>
          Dashboard
        </h1>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10, marginBottom: 24 }}>
        <KPI label="Ingresos (30d)" value={fmt$(stats.revenue30d)} trend={revTrend} dark />
        <KPI label="AOV" value={stats.aov > 0 ? `$${stats.aov.toFixed(2)}` : '—'} sub="Valor promedio por pedido" />
        <KPI label="Pedidos (30d)" value={String(stats.orders30d)} trend={ordTrend} />
        <KPI label="Conversión" value={`${conversionRate.toFixed(1)}%`} sub={`${stats.usersWithOrders} de ${stats.users} usuarios con pedido`} />
        <KPI label="Usuarios nuevos" value={String(stats.newUsers30d)} sub={`Total: ${stats.users}`} />
        <KPI label="Productos activos" value={String(stats.products)} sub="En catálogo" />
      </div>

      {/* Revenue chart */}
      <div style={{ background: '#fff', border: '1px solid rgba(52,49,51,0.1)', padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.38)', margin: '0 0 4px' }}>
              Ingresos · {periodLabel[period]}
            </p>
            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 26, color: '#1a1815', margin: 0, lineHeight: 1 }}>
              {fmt$(chartTotal)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '5px 12px',
                  fontFamily: 'var(--f-mono)',
                  fontSize: 8,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  background: period === p ? '#1a1815' : 'transparent',
                  color: period === p ? '#FAF5F0' : 'rgba(52,49,51,0.38)',
                  border: `1px solid ${period === p ? '#1a1815' : 'rgba(52,49,51,0.15)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {p === 'daily' ? 'Diario' : p === 'weekly' ? 'Semanal' : 'Mensual'}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={chartData} />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
        {[
          { href: '/admin/orders',    label: 'Pedidos',       desc: `${stats.orders30d} en los últimos 30d`, icon: '≡' },
          { href: '/admin/films',     label: 'Cortometrajes', desc: 'Gestionar proyectos y episodios',       icon: '▷' },
          { href: '/admin/merch',     label: 'Productos',     desc: 'Inventario, precios y variantes',       icon: '◻' },
          { href: '/admin/analytics', label: 'Analíticas',    desc: 'Ver reportes detallados',               icon: '◈' },
        ].map(({ href, label, desc, icon }) => (
          <Link
            key={href}
            href={href}
            style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid rgba(52,49,51,0.1)', padding: '14px 16px', textDecoration: 'none', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,112,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(52,49,51,0.1)')}
          >
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 14, color: '#C9A870', width: 20, flexShrink: 0 }}>{icon}</span>
            <div>
              <p style={{ fontFamily: 'var(--f-display)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1815', margin: '0 0 2px' }}>{label}</p>
              <p style={{ fontFamily: 'var(--f-sans)', fontSize: 11, color: 'rgba(52,49,51,0.4)', margin: 0 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
