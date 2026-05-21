import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export const revalidate = 0

async function getUsers(): Promise<Profile[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Profile[]) ?? []
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-wider uppercase text-charcoal">
          Usuarios
        </h1>
        <span className="font-body text-xs text-charcoal/40 tracking-widest uppercase">
          {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20 border border-charcoal/10">
          <p className="font-body text-charcoal/40">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10">
                {['Usuario', 'Email', 'Rol', 'Puntos', 'Miembro desde'].map((h) => (
                  <th key={h} className="text-left font-body text-xs tracking-widest uppercase text-charcoal/40 pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-charcoal/2">
                  <td className="py-4 pr-4">
                    <p className="font-body text-sm font-medium">{user.full_name ?? '—'}</p>
                    <p className="font-body text-xs text-charcoal/30">{user.id.slice(0, 8)}...</p>
                  </td>
                  <td className="py-4 pr-4 font-body text-sm text-charcoal/70">{user.email ?? '—'}</td>
                  <td className="py-4 pr-4">
                    <span className={`font-display font-bold text-xs tracking-wider uppercase px-2 py-0.5 ${
                      user.role === 'admin'
                        ? 'bg-gold/20 text-gold'
                        : 'bg-charcoal/10 text-charcoal/60'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="flex items-center gap-1">
                      <span className="text-gold text-xs">★</span>
                      <span className="font-body text-sm font-medium">{user.points_balance.toFixed(2)}</span>
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-body text-sm text-charcoal/50">
                    {new Date(user.created_at).toLocaleDateString('es-PR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
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
