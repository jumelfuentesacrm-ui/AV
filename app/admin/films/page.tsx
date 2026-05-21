'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Film } from '@/types'

const EMPTY: Partial<Film> = {
  title: '', slug: '', artist_name: '', description: '', short_description: '',
  poster_url: '', video_url: '', status: 'upcoming', duration_minutes: undefined, featured: false,
}

const STATUS: Record<Film['status'], { label: string; color: string; bg: string }> = {
  upcoming:      { label: 'Próximamente', color: '#C9A870', bg: 'rgba(201,168,112,0.12)' },
  in_production: { label: 'En Producción', color: '#1a1815', bg: 'rgba(52,49,51,0.1)' },
  released:      { label: 'Disponible',   color: '#2a6e44', bg: 'rgba(42,110,68,0.1)' },
}

export default function AdminFilmsPage() {
  const [films, setFilms]   = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Film> | null>(null)
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('films').select('*').order('order_index', { ascending: true })
    setFilms((data as Film[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetch() }, [fetch])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    const payload = { ...editing, slug: editing.slug || slugify(editing.title ?? ''), duration_minutes: editing.duration_minutes ? Number(editing.duration_minutes) : null }
    if (editing.id) {
      await supabase.from('films').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('films').insert(payload)
    }
    setSaving(false)
    setEditing(null)
    fetch()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('films').delete().eq('id', id)
    setDeleteId(null)
    fetch()
  }

  const byStatus = (s: Film['status']) => films.filter(f => f.status === s).length

  return (
    <div style={{ padding: 'clamp(16px,4vw,36px)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.35)', margin: 0 }}>Admin</p>
          <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 'clamp(20px,3vw,32px)', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a1815', margin: '4px 0 0' }}>
            Cortometrajes
          </h1>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          style={{ background: '#1a1815', color: '#FAF5F0', border: 'none', padding: '10px 20px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          + Nuevo
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Total', value: films.length, color: '#1a1815' },
          { label: 'Próximamente', value: byStatus('upcoming'), color: '#C9A870' },
          { label: 'En producción', value: byStatus('in_production'), color: '#1a1815' },
          { label: 'Disponibles', value: byStatus('released'), color: '#2a6e44' },
          { label: 'Destacados', value: films.filter(f => f.featured).length, color: '#C9A870' },
          { label: 'Vistas totales', value: '—', color: 'rgba(52,49,51,0.25)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid rgba(52,49,51,0.1)', padding: '14px 16px' }}>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.38)', margin: '0 0 6px' }}>{label}</p>
            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 22, color, margin: 0, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Film cards */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(52,49,51,0.1)', borderTopColor: '#C9A870', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : films.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px dashed rgba(52,49,51,0.2)' }}>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.3)' }}>No hay proyectos</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {films.map(film => (
            <FilmCard
              key={film.id}
              film={film}
              onEdit={() => setEditing(film)}
              onDelete={() => setDeleteId(film.id)}
            />
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,18,16,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FAF5F0', width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(52,49,51,0.1)' }}>
              <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1815', margin: 0 }}>
                {editing.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: 'rgba(52,49,51,0.4)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Título *" style={{ gridColumn: '1/-1' }}>
                  <input className="av-input" type="text" value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value, slug: slugify(e.target.value) })} />
                </Field>
                <Field label="Slug">
                  <input className="av-input" type="text" value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
                </Field>
                <Field label="Artista">
                  <input className="av-input" type="text" value={editing.artist_name ?? ''} onChange={e => setEditing({ ...editing, artist_name: e.target.value })} />
                </Field>
                <Field label="Descripción corta" style={{ gridColumn: '1/-1' }}>
                  <input className="av-input" type="text" value={editing.short_description ?? ''} onChange={e => setEditing({ ...editing, short_description: e.target.value })} />
                </Field>
                <Field label="Descripción completa" style={{ gridColumn: '1/-1' }}>
                  <textarea className="av-input" value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={4} style={{ resize: 'vertical' }} />
                </Field>
                <Field label="URL del Poster" style={{ gridColumn: '1/-1' }}>
                  <input className="av-input" type="url" value={editing.poster_url ?? ''} onChange={e => setEditing({ ...editing, poster_url: e.target.value })} placeholder="https://..." />
                </Field>
                <Field label="URL del Video">
                  <input className="av-input" type="url" value={editing.video_url ?? ''} onChange={e => setEditing({ ...editing, video_url: e.target.value })} placeholder="https://youtube.com/..." />
                </Field>
                <Field label="Estado">
                  <select className="av-input" value={editing.status ?? 'upcoming'} onChange={e => setEditing({ ...editing, status: e.target.value as Film['status'] })}>
                    <option value="upcoming">Próximamente</option>
                    <option value="in_production">En Producción</option>
                    <option value="released">Disponible</option>
                  </select>
                </Field>
                <Field label="Duración (min)">
                  <input className="av-input" type="number" value={editing.duration_minutes ?? ''} onChange={e => setEditing({ ...editing, duration_minutes: e.target.value ? Number(e.target.value) : undefined })} min={1} max={60} />
                </Field>
                <Field label="Fecha de estreno">
                  <input className="av-input" type="date" value={editing.release_date ?? ''} onChange={e => setEditing({ ...editing, release_date: e.target.value })} />
                </Field>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={editing.featured ?? false} onChange={e => setEditing({ ...editing, featured: e.target.checked })} style={{ width: 15, height: 15, accentColor: '#C9A870' }} />
                <span style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: '#1a1815' }}>Destacado en homepage</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '16px 22px', borderTop: '1px solid rgba(52,49,51,0.1)' }}>
              <button
                onClick={handleSave}
                disabled={saving || !editing.title}
                style={{ background: '#1a1815', color: '#FAF5F0', border: 'none', padding: '11px 28px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: saving || !editing.title ? 'not-allowed' : 'pointer', opacity: saving || !editing.title ? 0.5 : 1 }}
              >
                {saving ? '···' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditing(null)}
                style={{ background: 'transparent', color: '#1a1815', border: '1px solid rgba(52,49,51,0.2)', padding: '11px 22px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
          <style>{`.av-input{width:100%;border:1px solid rgba(52,49,51,0.14);padding:9px 11px;font-family:var(--f-sans);font-size:13px;background:#FAF5F0;color:#1a1815;outline:none;box-sizing:border-box}.av-input:focus{border-color:rgba(201,168,112,0.6)}`}</style>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,18,16,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#FAF5F0', padding: 36, maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1815', margin: '0 0 8px' }}>¿Eliminar proyecto?</p>
            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'rgba(52,49,51,0.5)', margin: '0 0 24px' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => handleDelete(deleteId)} style={{ background: '#c64a3b', color: '#fff', border: 'none', padding: '10px 24px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>Eliminar</button>
              <button onClick={() => setDeleteId(null)} style={{ background: 'transparent', border: '1px solid rgba(52,49,51,0.2)', padding: '10px 20px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilmCard({ film, onEdit, onDelete }: { film: Film; onEdit: () => void; onDelete: () => void }) {
  const s = STATUS[film.status]
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(52,49,51,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Poster */}
      <div style={{ height: 160, background: film.poster_url ? undefined : 'linear-gradient(160deg,#1e1a17 0%,#2a2420 100%)', position: 'relative', flexShrink: 0 }}>
        {film.poster_url ? (
          <img src={film.poster_url} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 28, color: 'rgba(242,231,223,0.08)' }}>▷</span>
          </div>
        )}
        {film.featured && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: '#C9A870', color: '#1a1815', fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.15em', padding: '3px 7px', textTransform: 'uppercase' }}>
            ★ Destacado
          </span>
        )}
        <span style={{ position: 'absolute', bottom: 10, left: 10, background: s.bg, color: s.color, fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.12em', padding: '3px 8px', textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>
          {s.label}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1815', margin: '0 0 4px', lineHeight: 1.2 }}>
          {film.title}
        </h3>
        {film.artist_name && (
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 12, color: 'rgba(52,49,51,0.55)', margin: '0 0 10px' }}>{film.artist_name}</p>
        )}

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
          {film.duration_minutes && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(52,49,51,0.4)', letterSpacing: '0.1em' }}>
              {film.duration_minutes}min
            </span>
          )}
          {film.release_date && (
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(52,49,51,0.4)', letterSpacing: '0.1em' }}>
              {new Date(film.release_date).toLocaleDateString('es-PR', { month: 'short', year: 'numeric' })}
            </span>
          )}
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(52,49,51,0.3)', letterSpacing: '0.1em' }}>
            — vistas
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', borderTop: '1px solid rgba(52,49,51,0.07)' }}>
        <button
          onClick={onEdit}
          style={{ flex: 1, background: 'none', border: 'none', padding: '11px', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1815', cursor: 'pointer', borderRight: '1px solid rgba(52,49,51,0.07)', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,49,51,0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          style={{ flex: 1, background: 'none', border: 'none', padding: '11px', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(198,74,59,0.7)', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(198,74,59,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.4)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
