'use client'

import { useRef, useState, useTransition, useCallback, useEffect } from 'react'
import type { PageSection } from '@/types'
import {
  toggleSectionVisible,
  moveSectionUp,
  moveSectionDown,
  updateSectionContent,
} from './actions'

// Maps home-page section IDs → CMS section_keys
const ID_TO_KEY: Record<string, string> = {
  top:          'hero',
  manifiesto:   'manifesto',
  episodios:    'episodios',
  indumentaria: 'indumentaria',
  maquinas:     'maquinas',
  suscripcion:  'subscribe',
}

// Which content fields each section supports
const SECTION_FIELDS: Record<string, string[]> = {
  hero:          ['title', 'subtitle', 'button_text', 'button_href'],
  manifesto:     ['title', 'subtitle', 'body'],
  episodios:     ['title', 'subtitle'],
  indumentaria:  ['title', 'subtitle'],
  maquinas:      ['title', 'subtitle', 'body'],
  subscribe:     ['title', 'subtitle', 'button_text', 'button_href'],
}

const FIELD_LABELS: Record<string, string> = {
  title:       'Título',
  subtitle:    'Subtítulo',
  body:        'Texto principal',
  button_text: 'Texto del botón',
  button_href: 'URL del botón',
}

function inputStyle(multiline = false): React.CSSProperties {
  return {
    width: '100%',
    border: '1px solid rgba(52,49,51,0.12)',
    padding: '7px 10px',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 13,
    background: '#FAF5F0',
    borderRadius: 2,
    resize: multiline ? 'vertical' : 'none',
    outline: 'none',
    lineHeight: 1.5,
  }
}

function SectionEditor({
  section,
  isFirst,
  isLast,
  isActive,
  cardRef,
}: {
  section: PageSection
  isFirst: boolean
  isLast: boolean
  isActive: boolean
  cardRef: (el: HTMLDivElement | null) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const content = (section.content as Record<string, string>) ?? {}
  const fields = SECTION_FIELDS[section.section_key] ?? []

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const label = fd.get('label') as string
    const fieldValues: Record<string, string> = {}
    fields.forEach(f => {
      const v = fd.get(f)
      if (v !== null) fieldValues[f] = v as string
    })
    startTransition(async () => {
      await updateSectionContent(section.id, label, fieldValues)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div
      ref={cardRef}
      style={{
        background: '#fff',
        border: `1px solid ${isActive ? '#C9A870' : 'rgba(52,49,51,0.09)'}`,
        borderTop: isActive ? '2.5px solid #C9A870' : '1px solid rgba(52,49,51,0.09)',
        marginBottom: 8,
        transition: 'border-color 0.2s',
        boxShadow: isActive ? '0 0 0 3px rgba(201,168,112,0.12)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: isActive ? 'rgba(201,168,112,0.08)' : '#f7f4f1',
        borderBottom: '1px solid rgba(52,49,51,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#C9A870', letterSpacing: '0.05em' }}>
            #{section.order_index + 1}
          </span>
          <span style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a1815' }}>
            {section.label}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(52,49,51,0.35)', fontFamily: 'monospace' }}>
            {section.section_key}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {!isFirst && (
            <button
              title="Mover arriba"
              onClick={() => startTransition(() => moveSectionUp(section.id, section.order_index))}
              style={{ width: 24, height: 24, border: '1px solid rgba(52,49,51,0.15)', background: '#fff', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >↑</button>
          )}
          {!isLast && (
            <button
              title="Mover abajo"
              onClick={() => startTransition(() => moveSectionDown(section.id, section.order_index))}
              style={{ width: 24, height: 24, border: '1px solid rgba(52,49,51,0.15)', background: '#fff', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >↓</button>
          )}
          <button
            title={section.visible ? 'Ocultar sección' : 'Mostrar sección'}
            onClick={() => startTransition(() => toggleSectionVisible(section.id, section.visible))}
            style={{
              padding: '0 8px',
              height: 24,
              border: `1px solid ${section.visible ? 'rgba(201,168,112,0.5)' : 'rgba(52,49,51,0.15)'}`,
              background: section.visible ? 'rgba(201,168,112,0.12)' : '#fff',
              color: section.visible ? '#b8913a' : 'rgba(52,49,51,0.4)',
              cursor: 'pointer',
              fontSize: 9,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {section.visible ? '● Visible' : '○ Oculto'}
          </button>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ display: 'block', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.4)', marginBottom: 4 }}>
            Etiqueta
          </label>
          <input name="label" defaultValue={section.label} style={inputStyle()} />
        </div>

        {fields.map(field => (
          <div key={field} style={field === 'body' ? {} : {}}>
            <label style={{ display: 'block', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.4)', marginBottom: 4 }}>
              {FIELD_LABELS[field] ?? field}
            </label>
            {field === 'body' ? (
              <textarea name={field} defaultValue={content[field] ?? ''} rows={3} style={inputStyle(true)} />
            ) : (
              <input name={field} defaultValue={content[field] ?? ''} style={inputStyle()} />
            )}
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '7px 20px',
              background: saved ? '#1e7e4a' : '#1a1815',
              color: '#FAF5F0',
              border: 'none',
              cursor: isPending ? 'wait' : 'pointer',
              fontSize: 10,
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'background 0.3s',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {saved ? '✓ Guardado' : isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function CMSEditor({ sections }: { sections: PageSection[] }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [iframeReady, setIframeReady] = useState(false)
  const [, startTransition] = useTransition()
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Listen for postMessage from iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.av_cms_section) {
        const key = e.data.av_cms_section as string
        setActiveKey(key)
        const card = cardRefs.current[key]
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // After iframe loads, inject click interceptors (same-origin)
  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    setIframeReady(true)

    const doc = iframe.contentDocument

    // Add a style tag for the hover cursor effect
    const style = doc.createElement('style')
    style.textContent = `
      [data-cms-section] { cursor: pointer !important; }
      [data-cms-section]:hover::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 2px solid #C9A870;
        pointer-events: none;
        z-index: 9999;
      }
      [data-cms-section] { position: relative; }
    `
    doc.head.appendChild(style)

    // Tag each section element and attach click listener
    Object.entries(ID_TO_KEY).forEach(([domId, sectionKey]) => {
      const el = doc.getElementById(domId)
      if (!el) return
      el.setAttribute('data-cms-section', sectionKey)
      el.addEventListener('click', (ev) => {
        ev.preventDefault()
        window.parent.postMessage({ av_cms_section: sectionKey }, '*')
      }, { capture: true })
    })
  }, [])

  function reloadIframe() {
    const iframe = iframeRef.current
    if (iframe) {
      setIframeReady(false)
      iframe.src = iframe.src
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      {/* Left: iframe preview */}
      <div style={{ flex: '0 0 58%', position: 'relative', borderRight: '1px solid rgba(52,49,51,0.1)' }}>
        {/* Toolbar */}
        <div style={{
          height: 36,
          background: '#1a1815',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,245,240,0.4)' }}>
              Vista previa
            </span>
            {iframeReady && (
              <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#C9A870', letterSpacing: '0.05em' }}>
                · Toca una sección para editar
              </span>
            )}
          </div>
          <button
            onClick={() => { startTransition(() => {}); reloadIframe() }}
            style={{
              padding: '3px 10px',
              background: 'rgba(201,168,112,0.15)',
              border: '1px solid rgba(201,168,112,0.3)',
              color: '#C9A870',
              cursor: 'pointer',
              fontSize: 9,
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ↻ Recargar
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src="/"
          onLoad={onIframeLoad}
          style={{ width: '100%', height: 'calc(100% - 36px)', border: 'none', display: 'block' }}
          title="Vista previa del sitio"
        />
      </div>

      {/* Right: section editors */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#F7F4F1' }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#fff',
          borderBottom: '1px solid rgba(52,49,51,0.09)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 36,
        }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a1815' }}>
              Editor de Contenido
            </span>
            <span style={{ fontSize: 10, color: 'rgba(52,49,51,0.35)', marginLeft: 8 }}>
              {sections.length} secciones
            </span>
          </div>
        </div>

        <div style={{ padding: '10px 12px' }}>
          {sections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(52,49,51,0.35)', fontSize: 13 }}>
              No hay secciones configuradas.
            </div>
          ) : (
            sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                isActive={activeKey === section.section_key}
                cardRef={el => { cardRefs.current[section.section_key] = el }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
