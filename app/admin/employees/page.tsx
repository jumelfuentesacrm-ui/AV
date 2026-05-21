import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Profile, EmployeePermissions } from '@/types'
import PermissionsRow from './PermissionsRow'

export const revalidate = 0

type EmployeeWithPermissions = Profile & {
  permissions: EmployeePermissions | null
}

async function getEmployees(): Promise<EmployeeWithPermissions[]> {
  const supabase = createClient()
  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'employee')
    .order('created_at', { ascending: false })

  if (!employees || employees.length === 0) return []

  const ids = (employees as Profile[]).map((e) => e.id)
  const { data: perms } = await supabase
    .from('employee_permissions')
    .select('*')
    .in('user_id', ids)

  return (employees as Profile[]).map((emp) => ({
    ...emp,
    permissions: ((perms as EmployeePermissions[]) ?? []).find((p) => p.user_id === emp.id) ?? null,
  }))
}

async function getCustomers(): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at, points_balance')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(50)
  return (data as Profile[]) ?? []
}

async function promoteToEmployee(formData: FormData) {
  'use server'
  const userId = formData.get('user_id') as string
  const supabase = createClient()
  await supabase.from('profiles').update({ role: 'employee' }).eq('id', userId)
  // Create default permissions row
  await supabase.from('employee_permissions').upsert(
    {
      user_id: userId,
      can_edit_prices: false,
      can_manage_orders: false,
      can_manage_inventory: false,
      can_view_analytics: false,
      can_edit_site_content: false,
      can_process_refunds: false,
    },
    { onConflict: 'user_id' }
  )
  revalidatePath('/admin/employees')
}

async function demoteToCustomer(formData: FormData) {
  'use server'
  const userId = formData.get('user_id') as string
  const supabase = createClient()
  await supabase.from('profiles').update({ role: 'customer' }).eq('id', userId)
  revalidatePath('/admin/employees')
}

async function updatePermission(formData: FormData) {
  'use server'
  const userId = formData.get('user_id') as string
  const permission = formData.get('permission') as string
  const value = formData.get('value') === 'true'

  const validPerms = [
    'can_edit_prices',
    'can_manage_orders',
    'can_manage_inventory',
    'can_view_analytics',
    'can_edit_site_content',
    'can_process_refunds',
  ]
  if (!validPerms.includes(permission)) return

  const supabase = createClient()
  await supabase
    .from('employee_permissions')
    .upsert(
      { user_id: userId, [permission]: value },
      { onConflict: 'user_id' }
    )
  revalidatePath('/admin/employees')
}

const PERM_LABELS: Record<string, string> = {
  can_edit_prices: 'Editar precios',
  can_manage_orders: 'Gestionar pedidos',
  can_manage_inventory: 'Gestionar inventario',
  can_view_analytics: 'Ver analíticas',
  can_edit_site_content: 'Editar contenido',
  can_process_refunds: 'Procesar reembolsos',
}

const PERM_KEYS = Object.keys(PERM_LABELS) as (keyof EmployeePermissions)[]

export default async function AdminEmployeesPage() {
  const [employees, customers] = await Promise.all([getEmployees(), getCustomers()])

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 800,
            fontSize: '1.875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#1a1815',
            margin: 0,
          }}
        >
          Empleados
        </h1>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'rgba(26,24,21,0.4)', marginTop: '0.25rem' }}>
          {employees.length} empleados activos · Gestiona permisos y roles
        </p>
      </div>

      {/* Employees list */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#1a1815',
            marginBottom: '1rem',
          }}
        >
          Empleados actuales
        </h2>

        {employees.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 0',
              border: '1px solid rgba(0,0,0,0.08)',
              fontFamily: 'var(--f-sans)',
              color: 'rgba(26,24,21,0.4)',
            }}
          >
            No hay empleados configurados aún.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employees.map((emp) => (
              <div
                key={emp.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {/* Employee header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1.25rem',
                    background: '#1a1815',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--f-display)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#FAF5F0',
                      }}
                    >
                      {emp.full_name ?? 'Sin nombre'}
                    </span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', color: 'rgba(250,245,240,0.4)' }}>
                      {emp.email ?? '—'}
                    </span>
                  </div>
                  <form action={demoteToCustomer}>
                    <input type="hidden" name="user_id" value={emp.id} />
                    <button
                      type="submit"
                      style={{
                        background: 'rgba(220,38,38,0.15)',
                        border: '1px solid rgba(220,38,38,0.3)',
                        color: 'rgba(252,165,165,0.9)',
                        padding: '0.25rem 0.75rem',
                        fontFamily: 'var(--f-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      Degradar a cliente
                    </button>
                  </form>
                </div>

                {/* Permissions grid */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.75rem' }}>
                    Permisos
                  </p>
                  <PermissionsRow
                    userId={emp.id}
                    permissions={emp.permissions}
                    permKeys={PERM_KEYS as string[]}
                    permLabels={PERM_LABELS}
                    updatePermission={updatePermission}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promote customers section */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#1a1815',
            marginBottom: '1rem',
          }}
        >
          Promover clientes a empleados
        </h2>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  {['Nombre', 'Email', 'Miembro desde', 'Acción'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        fontFamily: 'var(--f-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#6B6560',
                        padding: '0.75rem 1.25rem',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '0.75rem 1.25rem', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: '#1a1815' }}>
                      {customer.full_name ?? '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontFamily: 'var(--f-mono)', fontSize: '0.75rem', color: '#6B6560' }}>
                      {customer.email ?? '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', color: '#8C7B6B' }}>
                      {new Date(customer.created_at).toLocaleDateString('es-PR', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem 1.25rem' }}>
                      <form action={promoteToEmployee}>
                        <input type="hidden" name="user_id" value={customer.id} />
                        <button
                          type="submit"
                          style={{
                            background: 'rgba(201,168,112,0.15)',
                            border: '1px solid rgba(201,168,112,0.4)',
                            color: '#C9A870',
                            padding: '0.25rem 0.75rem',
                            fontFamily: 'var(--f-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                          }}
                        >
                          Promover
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: '3rem',
                        textAlign: 'center',
                        fontFamily: 'var(--f-sans)',
                        color: 'rgba(26,24,21,0.4)',
                      }}
                    >
                      No hay clientes disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
