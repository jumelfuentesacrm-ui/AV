'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StarburstLogo from '@/components/ui/StarburstLogo'
import { slugify } from '@/lib/utils'
import type { Film } from '@/types'

const EMPTY_FILM: Partial<Film> = {
  title: '',
  slug: '',
  artist_name: '',
  description: '',
  short_description: '',
  poster_url: '',
  video_url: '',
  status: 'upcoming',
  duration_minutes: undefined,
  featured: false,
}

export default function AdminFilmsPage() {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Film> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchFilms = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('films').select('*').order('created_at', { ascending: false })
    setFilms((data as Film[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchFilms() }, [fetchFilms])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    const payload = {
      ...editing,
      slug: editing.slug || slugify(editing.title ?? ''),
      duration_minutes: editing.duration_minutes ? Number(editing.duration_minutes) : null,
    }
    if (editing.id) {
      await supabase.from('films').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('films').insert(payload)
    }
    setSaving(false)
    setEditing(null)
    fetchFilms()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('films').delete().eq('id', id)
    setDeleteId(null)
    fetchFilms()
  }

  const statusConfig = {
    upcoming: { label: 'Próximamente', cls: 'bg-gold/20 text-gold' },
    released: { label: 'Disponible', cls: 'bg-green-100 text-green-700' },
    in_production: { label: 'En Producción', cls: 'bg-charcoal/10 text-charcoal' },
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-wider uppercase text-charcoal">
          Cortometrajes
        </h1>
        <button
          onClick={() => setEditing({ ...EMPTY_FILM })}
          className="bg-dark text-cream font-display font-bold text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-charcoal transition-colors duration-200"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <StarburstLogo size={40} color="#C9A870" className="animate-spin opacity-50" />
        </div>
      ) : films.length === 0 ? (
        <div className="text-center py-20 border border-charcoal/10">
          <p className="font-body text-charcoal/40">No hay proyectos aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10">
                {['Título', 'Artista', 'Estado', 'Destacado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left font-body text-xs tracking-widest uppercase text-charcoal/40 pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {films.map((film) => (
                <tr key={film.id} className="hover:bg-charcoal/2">
                  <td className="py-4 pr-4">
                    <p className="font-display font-bold text-sm tracking-wide uppercase">{film.title}</p>
                    <p className="font-body text-xs text-charcoal/40">{film.slug}</p>
                  </td>
                  <td className="py-4 pr-4 font-body text-sm text-charcoal/70">{film.artist_name ?? '—'}</td>
                  <td className="py-4 pr-4">
                    <span className={`font-display font-bold text-xs tracking-wider uppercase px-2 py-0.5 ${statusConfig[film.status].cls}`}>
                      {statusConfig[film.status].label}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-body text-sm text-charcoal/50">
                    {film.featured ? '★ Sí' : '—'}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditing(film)}
                        className="font-body text-xs text-gold hover:text-charcoal transition-colors duration-200 uppercase tracking-wider"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteId(film.id)}
                        className="font-body text-xs text-red-400 hover:text-red-600 transition-colors duration-200 uppercase tracking-wider"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-dark/80 flex items-center justify-center p-4">
          <div className="bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
              <h2 className="font-display font-bold text-xl tracking-wider uppercase">
                {editing.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <button onClick={() => setEditing(null)} className="text-charcoal/40 hover:text-charcoal text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <FormField label="Título *">
                <input
                  type="text"
                  value={editing.title ?? ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: slugify(e.target.value) })}
                  className="admin-input"
                />
              </FormField>
              <FormField label="Slug">
                <input
                  type="text"
                  value={editing.slug ?? ''}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="admin-input"
                />
              </FormField>
              <FormField label="Artista">
                <input
                  type="text"
                  value={editing.artist_name ?? ''}
                  onChange={(e) => setEditing({ ...editing, artist_name: e.target.value })}
                  className="admin-input"
                />
              </FormField>
              <FormField label="Descripción corta">
                <input
                  type="text"
                  value={editing.short_description ?? ''}
                  onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                  className="admin-input"
                />
              </FormField>
              <FormField label="Descripción completa">
                <textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={5}
                  className="admin-input resize-none"
                />
              </FormField>
              <FormField label="URL del Poster">
                <input
                  type="url"
                  value={editing.poster_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, poster_url: e.target.value })}
                  className="admin-input"
                  placeholder="https://..."
                />
              </FormField>
              <FormField label="URL del Video (YouTube / Vimeo)">
                <input
                  type="url"
                  value={editing.video_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                  className="admin-input"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Estado">
                  <select
                    value={editing.status ?? 'upcoming'}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as Film['status'] })}
                    className="admin-input"
                  >
                    <option value="upcoming">Próximamente</option>
                    <option value="in_production">En Producción</option>
                    <option value="released">Disponible</option>
                  </select>
                </FormField>
                <FormField label="Duración (min)">
                  <input
                    type="number"
                    value={editing.duration_minutes ?? ''}
                    onChange={(e) => setEditing({ ...editing, duration_minutes: e.target.value ? Number(e.target.value) : undefined })}
                    className="admin-input"
                    min={1}
                    max={60}
                  />
                </FormField>
              </div>
              <FormField label="Fecha de estreno">
                <input
                  type="date"
                  value={editing.release_date ?? ''}
                  onChange={(e) => setEditing({ ...editing, release_date: e.target.value })}
                  className="admin-input"
                />
              </FormField>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.featured ?? false}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="w-4 h-4 accent-gold"
                />
                <span className="font-body text-sm tracking-wider">Destacado en homepage</span>
              </label>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-charcoal/10">
              <button
                onClick={handleSave}
                disabled={saving || !editing.title}
                className="bg-dark text-cream font-display font-bold text-xs tracking-widest uppercase px-8 py-3 hover:bg-charcoal transition-colors duration-200 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="border border-charcoal/20 font-display font-bold text-xs tracking-widest uppercase px-6 py-3 hover:border-charcoal transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-dark/80 flex items-center justify-center p-4">
          <div className="bg-cream p-8 max-w-sm w-full text-center">
            <p className="font-display font-bold text-lg tracking-wider uppercase mb-2">¿Eliminar proyecto?</p>
            <p className="font-body text-sm text-charcoal/50 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-red-600 text-white font-display font-bold text-xs tracking-widest uppercase px-6 py-2.5"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="border border-charcoal/20 font-display font-bold text-xs tracking-widest uppercase px-6 py-2.5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-body text-xs tracking-widest uppercase text-charcoal/50 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
