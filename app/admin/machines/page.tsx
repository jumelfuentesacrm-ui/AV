'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StarburstLogo from '@/components/ui/StarburstLogo'
import type { MachineLocation } from '@/types'

const EMPTY: Partial<MachineLocation> = {
  mall_name: '',
  address: '',
  city: '',
  photo_url: '',
  hours: '',
  active: true,
}

export default function AdminMachinesPage() {
  const [machines, setMachines] = useState<MachineLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<MachineLocation> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchMachines = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('machine_locations').select('*').order('created_at', { ascending: true })
    setMachines((data as MachineLocation[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchMachines() }, [fetchMachines])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    if (editing.id) {
      await supabase.from('machine_locations').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('machine_locations').insert(editing)
    }
    setSaving(false)
    setEditing(null)
    fetchMachines()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('machine_locations').delete().eq('id', id)
    setDeleteId(null)
    fetchMachines()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-wider uppercase text-charcoal">
          Máquinas
        </h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="bg-dark text-cream font-display font-bold text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-charcoal transition-colors duration-200"
        >
          + Nueva Ubicación
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <StarburstLogo size={40} color="#C9A870" className="animate-spin opacity-50" />
        </div>
      ) : machines.length === 0 ? (
        <div className="text-center py-20 border border-charcoal/10">
          <p className="font-body text-charcoal/40">No hay ubicaciones aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => (
            <div key={machine.id} className="border border-charcoal/10 p-5">
              {machine.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={machine.photo_url} alt={machine.mall_name} className="w-full aspect-video object-cover mb-4" />
              )}
              <h3 className="font-display font-bold text-base tracking-wider uppercase">{machine.mall_name}</h3>
              {machine.city && <p className="font-body text-xs text-gold tracking-widest uppercase">{machine.city}</p>}
              {machine.address && <p className="font-body text-xs text-charcoal/50 mt-1">{machine.address}</p>}
              {machine.hours && <p className="font-body text-xs text-charcoal/40 mt-1">{machine.hours}</p>}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-charcoal/10">
                <button onClick={() => setEditing(machine)} className="font-body text-xs text-gold uppercase tracking-wider">
                  Editar
                </button>
                <button onClick={() => setDeleteId(machine.id)} className="font-body text-xs text-red-400 uppercase tracking-wider">
                  Eliminar
                </button>
                <span className={`ml-auto font-display font-bold text-xs uppercase tracking-wider px-2 py-0.5 ${machine.active ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/40'}`}>
                  {machine.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-dark/80 flex items-center justify-center p-4">
          <div className="bg-cream w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
              <h2 className="font-display font-bold text-xl tracking-wider uppercase">
                {editing.id ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </h2>
              <button onClick={() => setEditing(null)} className="text-charcoal/40 hover:text-charcoal text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'mall_name', label: 'Nombre del Mall *', type: 'text' },
                { key: 'city', label: 'Ciudad', type: 'text' },
                { key: 'address', label: 'Dirección', type: 'text' },
                { key: 'photo_url', label: 'URL de Foto', type: 'url' },
                { key: 'hours', label: 'Horario', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block font-body text-xs tracking-widest uppercase text-charcoal/50 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(editing as Record<string, string | number | boolean | undefined>)[key] as string ?? ''}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                    className="admin-input"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="w-4 h-4 accent-gold"
                />
                <span className="font-body text-sm">Activa</span>
              </label>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-charcoal/10">
              <button
                onClick={handleSave}
                disabled={saving || !editing.mall_name}
                className="bg-dark text-cream font-display font-bold text-xs tracking-widest uppercase px-8 py-3 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditing(null)} className="border border-charcoal/20 font-display font-bold text-xs tracking-widest uppercase px-6 py-3">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-dark/80 flex items-center justify-center p-4">
          <div className="bg-cream p-8 max-w-sm w-full text-center">
            <p className="font-display font-bold text-lg tracking-wider uppercase mb-2">¿Eliminar ubicación?</p>
            <p className="font-body text-sm text-charcoal/50 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex items-center gap-3 justify-center">
              <button onClick={() => handleDelete(deleteId)} className="bg-red-600 text-white font-display font-bold text-xs tracking-widest uppercase px-6 py-2.5">
                Sí, eliminar
              </button>
              <button onClick={() => setDeleteId(null)} className="border border-charcoal/20 font-display font-bold text-xs tracking-widest uppercase px-6 py-2.5">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
