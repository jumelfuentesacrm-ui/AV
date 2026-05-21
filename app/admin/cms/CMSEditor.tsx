'use client'

import { useState, useRef, useTransition } from 'react'
import { updateSection, publishPage, initializeSections } from './actions'
import type { PageSection } from '@/types'

const SECTION_FIELDS: Record<string, { key: string; label: string; multiline?: boolean }[]> = {
  hero: [
    { key: 'top_bar', label: 'Barra superior' },
  ],
  manifesto: [
    { key: 'heading', label: 'Título principal' },
    { key: 'lede', label: 'Frase destacada', multiline: true },
    { key: 'body1', label: 'Párrafo 1', multiline: true },
    { key: 'body2', label: 'Párrafo 2', multiline: true },
  ],
  episodios: [
    { key: 'chapter_body', label: 'Descripción del capítulo', multiline: true },
    { key: 'featured_title', label: 'Título del episodio destacado' },
    { key: 'featured_desc', label: 'Descripción del episodio', multiline: true },
  ],
  indumentaria: [
    { key: 'chapter_body', label: 'Descripción del capítulo', multiline: true },
    { key: 'statement_title', label: 'Título de la declaración' },
    { key: 'statement_lede', label: 'Frase de la declaración' },
    { key: 'statement_body', label: 'Texto de la declaración', multiline: true },
  ],
  maquinas: [
    { key: 'chapter_body', label: 'Descripción del capítulo', multiline: true },
    { key: 'copy_title', label: 'Título de la sección' },
    { key: 'copy_body', label: 'Texto de la sección', multiline: true },
  ],
  subscribe: [
    { key: 'heading', label: 'Título' },
    { key: 'body', label: 'Descripción', multiline: true },
  ],
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(0,0,0,0.12)',
  padding: '8px 10px',
  fontFamily: 'var(--f-sans)',
  fontSize: 13,
  background: '#FAF5F0',
  boxSizing: 'border-box',
  outline: 'none',
  lineHeight: 1.5,
  color: '#1a1815',
}

export default function CMSEditor({ sections: initial }: { sections: PageSection[] }) {
  const [sections] = useState(initial)
  const [expandedId, setExpandedId] = useState<string | null>(initial[0]?.id ?? null)
  const [values, setValues] = useState<Record<string, Record<string, string>>>(
    () => Object.fromEntries(initial.map(s => [s.id, (s.content as Record<string, string>) ?? {}]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [publishing, startPublish] = useTransition()
  const [initializing, startInit] = useTransition()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleFieldChange = (sectionId: string, field: string, value: string) => {
    setValues(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [field]: value } }))
  }

  const handleSave = async (section: PageSection) => {
    setSaving(section.id)
    await updateSection(section.id, section.label, values[section.id] ?? {})
    setSaving(null)
    setSavedId(section.id)
    setTimeout(() => setSavedId(null), 2500)
  }

  const handlePublish = () => {
    startPublish(async () => {
      await publishPage()
      const iframe = iframeRef.current
      if (iframe) iframe.src = iframe.src
    })
  }

  const handleInit = () => {
    startInit(async () => {
      await initializeSections()
      window.location.reload()
    })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Left: live preview ── */}
      <div style={{ flex: '0 0 60%', borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        {/* Browser bar */}
        <div style={{ background: '#141210', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['rgba(255,95,87,0.7)', 'rgba(254,188,46,0.7)', 'rgba(40,200,64,0.7)'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '4px 12px', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>
            archivovivo.com
          </div>
          <button
            onClick={() => { const f = iframeRef.current; if (f) f.src = f.src }}
            title="Recargar"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
          >
            ↺
          </button>
        </div>

        <iframe
          ref={iframeRef}
          src="/"
          title="Vista previa"
          style={{ flex: 1, border: 'none', width: '100%' }}
        />
      </div>

      {/* ── Right: editor ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#EEEBE7', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1815', margin: 0, fontWeight: 600 }}>
              Editor de Página
            </p>
            <p style={{ fontFamily: 'var(--f-sans)', fontSize: 11, color: 'rgba(26,24,21,0.4)', margin: '2px 0 0' }}>
              {sections.length} secciones · guarda y publica
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{ background: '#1a1815', color: '#FAF5F0', border: 'none', padding: '9px 18px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: publishing ? 'not-allowed' : 'pointer', opacity: publishing ? 0.6 : 1, transition: 'opacity 0.2s' }}
          >
            {publishing ? '···' : 'Publicar →'}
          </button>
        </div>

        {/* Sections list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {sections.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'rgba(26,24,21,0.5)', marginBottom: 20 }}>
                No hay secciones configuradas todavía.
              </p>
              <button
                onClick={handleInit}
                disabled={initializing}
                style={{ background: '#1a1815', color: '#FAF5F0', border: 'none', padding: '12px 24px', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                {initializing ? 'Inicializando...' : 'Inicializar secciones →'}
              </button>
            </div>
          ) : (
            sections.map(section => {
              const fields = SECTION_FIELDS[section.section_key] ?? []
              const isExpanded = expandedId === section.id
              const isSaving  = saving  === section.id
              const isSaved   = savedId === section.id
              const vals = values[section.id] ?? {}

              return (
                <div
                  key={section.id}
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', marginBottom: 8, overflow: 'hidden' }}
                >
                  {/* Section header toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : section.id)}
                    style={{ width: '100%', background: 'none', border: 'none', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(201,168,112,0.9)', letterSpacing: '0.1em' }}>
                        #{(section.order_index ?? 0) + 1}
                      </span>
                      <span style={{ fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 600, color: '#1a1815' }}>
                        {section.label}
                      </span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'rgba(26,24,21,0.28)', letterSpacing: '0.08em' }}>
                        {section.section_key}
                      </span>
                    </div>
                    <span style={{ color: 'rgba(26,24,21,0.35)', fontSize: 11, display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
                      ▾
                    </span>
                  </button>

                  {/* Fields */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '14px 14px 14px' }}>
                      {fields.length === 0 ? (
                        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 12, color: 'rgba(26,24,21,0.4)', margin: 0 }}>
                          Sin campos configurados para esta sección.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {fields.map(field => (
                            <div key={field.key}>
                              <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(26,24,21,0.4)', marginBottom: 5 }}>
                                {field.label}
                              </label>
                              {field.multiline ? (
                                <textarea
                                  value={vals[field.key] ?? ''}
                                  onChange={e => handleFieldChange(section.id, field.key, e.target.value)}
                                  rows={3}
                                  style={{ ...inputStyle, resize: 'vertical' }}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={vals[field.key] ?? ''}
                                  onChange={e => handleFieldChange(section.id, field.key, e.target.value)}
                                  style={inputStyle}
                                />
                              )}
                            </div>
                          ))}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                            <button
                              onClick={() => handleSave(section)}
                              disabled={isSaving}
                              style={{
                                background: isSaved ? '#2a6e44' : '#1a1815',
                                color: '#FAF5F0',
                                border: 'none',
                                padding: '8px 16px',
                                fontFamily: 'var(--f-mono)',
                                fontSize: 9,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.6 : 1,
                                transition: 'background 0.3s, opacity 0.2s',
                              }}
                            >
                              {isSaving ? '···' : isSaved ? '✓ Guardado' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
