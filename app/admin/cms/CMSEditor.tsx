'use client'

import { useRef, useState, useTransition, useCallback, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { PageSection, Product } from '@/types'
import {
  toggleSectionVisible,
  moveSectionUp,
  moveSectionDown,
  updateSectionContent,
  assignProductSlot,
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
  hero:          ['image_url', 'top_bar', 'tagline'],
  manifesto:     ['heading', 'lede', 'body1', 'body2'],
  episodios:     ['image_url', 'chapter_title', 'chapter_body', 'featured_title', 'featured_desc'],
  indumentaria:  ['image_url', 'chapter_title', 'chapter_body', 'statement_title', 'statement_lede', 'statement_body'],
  maquinas:      ['image_url', 'chapter_title', 'chapter_body', 'copy_title', 'copy_body'],
  subscribe:     ['heading', 'body'],
}

const FIELD_LABELS: Record<string, string> = {
  image_url:       'Imagen de sección',
  top_bar:         'Barra superior',
  tagline:         'Tagline',
  heading:         'Título principal',
  lede:            'Entradilla',
  body:            'Texto principal',
  body1:           'Párrafo 1',
  body2:           'Párrafo 2',
  chapter_title:   'Título capítulo',
  chapter_body:    'Texto capítulo',
  featured_title:  'Título episodio',
  featured_desc:   'Descripción episodio',
  statement_title: 'Título declaración',
  statement_lede:  'Entradilla declaración',
  statement_body:  'Texto declaración',
  copy_title:      'Título copy',
  copy_body:       'Texto copy',
}

const MULTILINE_FIELDS = new Set([
  'body', 'body1', 'body2', 'lede',
  'chapter_body', 'featured_desc',
  'statement_lede', 'statement_body', 'copy_body',
])

// ── Supabase browser client (for image uploads) ──────────────────────────────
const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function uploadImageFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `cms/${Date.now()}.${ext}`
  const { data, error } = await supabaseBrowser.storage
    .from('media')
    .upload(path, file, { upsert: true })
  if (error) throw error
  return supabaseBrowser.storage.from('media').getPublicUrl(data.path).data.publicUrl
}

// ── Styles ───────────────────────────────────────────────────────────────────
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

// ── ImageFieldEditor ─────────────────────────────────────────────────────────
function ImageFieldEditor({
  fieldName,
  value,
  onChange,
}: {
  fieldName: string
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null)

  // Probe dimensions when URL changes
  useEffect(() => {
    if (!value) { setImgDims(null); return }
    const img = new Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => setImgDims(null)
    img.src = value
  }, [value])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImageFile(file)
      onChange(url)
    } catch (err) {
      console.error('Image upload failed:', err)
      alert('Error al subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Preview row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="preview"
            style={{ height: 50, width: 'auto', objectFit: 'cover', border: '1px solid rgba(52,49,51,0.12)', borderRadius: 2 }}
          />
        ) : (
          <div style={{
            height: 50, width: 72,
            background: 'rgba(52,49,51,0.06)',
            border: '1px dashed rgba(52,49,51,0.2)',
            borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontFamily: 'monospace', color: 'rgba(52,49,51,0.35)',
          }}>
            sin img
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{
            fontSize: 9, fontFamily: 'monospace', color: '#C9A870',
            background: 'rgba(201,168,112,0.1)', padding: '2px 6px',
            borderRadius: 2, letterSpacing: '0.05em',
          }}>
            {imgDims ? `${imgDims.w} × ${imgDims.h} px` : '— × — px'}
          </span>
          <label style={{
            display: 'inline-block', cursor: 'pointer',
            padding: '3px 8px',
            border: '1px solid rgba(52,49,51,0.2)',
            background: uploading ? 'rgba(52,49,51,0.06)' : '#fff',
            fontSize: 9, fontFamily: 'monospace',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: uploading ? 'rgba(52,49,51,0.35)' : '#1a1815',
            borderRadius: 2,
            userSelect: 'none',
          }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
              disabled={uploading}
            />
            {uploading ? 'Subiendo…' : 'Cargar imagen →'}
          </label>
        </div>
      </div>
      {/* URL input */}
      <input
        name={fieldName}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://…"
        style={inputStyle()}
      />
    </div>
  )
}

// ── SectionEditor ─────────────────────────────────────────────────────────────
function SectionEditor({
  section,
  isFirst,
  isLast,
  isActive,
  activeField,
  cardRef,
}: {
  section: PageSection
  isFirst: boolean
  isLast: boolean
  isActive: boolean
  activeField: string | null
  cardRef: (el: HTMLDivElement | null) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const content = (section.content as Record<string, string>) ?? {}
  const fields = SECTION_FIELDS[section.section_key] ?? []

  // Local state for image URL fields (controlled)
  const [imageValues, setImageValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    fields.forEach(f => {
      if (f === 'image_url') init[f] = content[f] ?? ''
    })
    return init
  })

  // Refs for auto-focusing fields
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})

  // Auto-focus matching field when activeField changes
  useEffect(() => {
    if (isActive && activeField) {
      const el = fieldRefs.current[activeField]
      if (el) {
        setTimeout(() => el.focus(), 80)
      }
    }
  }, [isActive, activeField])

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const label = fd.get('label') as string
    const fieldValues: Record<string, string> = {}
    fields.forEach(f => {
      if (f === 'image_url') {
        fieldValues[f] = imageValues[f] ?? ''
      } else {
        const v = fd.get(f)
        if (v !== null) fieldValues[f] = v as string
      }
    })
    setSaveError(null)
    startTransition(async () => {
      try {
        await updateSectionContent(section.id, label, fieldValues)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Error al guardar')
        setTimeout(() => setSaveError(null), 5000)
      }
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

        {fields.map(field => {
          const isActive_ = activeField === field
          return (
            <div
              key={field}
              style={{
                borderLeft: isActive_ ? '3px solid #C9A870' : '3px solid transparent',
                paddingLeft: 8,
                transition: 'border-color 0.2s',
              }}
            >
              <label style={{ display: 'block', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(52,49,51,0.4)', marginBottom: 4 }}>
                {FIELD_LABELS[field] ?? field}
              </label>
              {field === 'image_url' ? (
                <ImageFieldEditor
                  fieldName={field}
                  value={imageValues[field] ?? ''}
                  onChange={url => setImageValues(prev => ({ ...prev, [field]: url }))}
                />
              ) : MULTILINE_FIELDS.has(field) ? (
                <textarea
                  name={field}
                  defaultValue={content[field] ?? ''}
                  rows={3}
                  style={inputStyle(true)}
                  ref={el => { fieldRefs.current[field] = el }}
                />
              ) : (
                <input
                  name={field}
                  defaultValue={content[field] ?? ''}
                  style={inputStyle()}
                  ref={el => { fieldRefs.current[field] = el }}
                />
              )}
            </div>
          )
        })}

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, paddingTop: 4 }}>
          {saveError && (
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#c64a3b', maxWidth: 200 }}>
              ✕ {saveError}
            </span>
          )}
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '7px 20px',
              background: saveError ? '#c64a3b' : saved ? '#1e7e4a' : '#1a1815',
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
            {saveError ? '✕ Error' : saved ? '✓ Guardado' : isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── TagSVG ─────────────────────────────────────────────────────────────────────
function TagSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

// ── ProductPicker ──────────────────────────────────────────────────────────────
function ProductPicker({
  activeSlot,
  sectionId,
  currentSlots,
  products,
  onAssign,
  onBack,
}: {
  activeSlot: string
  sectionId: string | null
  currentSlots: Record<string, string | null>
  products: Product[]
  onAssign: (slotKey: string, productId: string | null) => void
  onBack: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const currentProductId = currentSlots[activeSlot] ?? null

  const slotParts = activeSlot.split('_')
  const slotType = slotParts[0] === 'camisas' ? 'Camisas' : slotParts[0] === 'tees' ? 'Tees' : slotParts[0]
  const slotNum = Number(slotParts[slotParts.length - 1]) + 1
  const slotLabel = `${slotType} — Slot ${slotNum}`

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F7F4F1' }}>
      {/* Header */}
      <div style={{
        padding: '0 16px',
        height: 36,
        background: '#fff',
        borderBottom: '1px solid rgba(52,49,51,0.09)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(52,49,51,0.45)', fontSize: 16, padding: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}
          title="Volver"
        >←</button>
        <TagSVG />
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1815' }}>
            Catálogo
          </span>
          <span style={{ fontSize: 10, color: 'rgba(52,49,51,0.4)', marginLeft: 8 }}>{slotLabel}</span>
        </div>
        {currentProductId && (
          <button
            onClick={() => startTransition(() => onAssign(activeSlot, null))}
            disabled={isPending}
            style={{
              fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#c64a3b', background: 'none',
              border: '1px solid rgba(198,74,59,0.3)', padding: '3px 8px',
              cursor: 'pointer', borderRadius: 2,
            }}
          >
            Quitar
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(52,49,51,0.35)', fontSize: 12 }}>
            Cargando productos…
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {products.map(product => {
              const isSelected = product.id === currentProductId
              return (
                <button
                  key={product.id}
                  onClick={() => startTransition(() => onAssign(activeSlot, product.id))}
                  disabled={isPending}
                  style={{
                    background: '#fff',
                    border: isSelected ? '2px solid #C9A870' : '1px solid rgba(52,49,51,0.1)',
                    borderRadius: 2,
                    padding: 0,
                    cursor: isPending ? 'wait' : 'pointer',
                    textAlign: 'left',
                    overflow: 'hidden',
                    boxShadow: isSelected ? '0 0 0 3px rgba(201,168,112,0.12)' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    opacity: isPending ? 0.65 : 1,
                  }}
                >
                  <div style={{ aspectRatio: '4/3', background: '#2a221a', overflow: 'hidden', position: 'relative' }}>
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#2a221a,#3d2e1f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(242,231,223,0.3)', letterSpacing: '0.1em' }}>SIN FOTO</span>
                      </div>
                    )}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 4, right: 4, background: '#C9A870', color: '#fff', fontSize: 8, fontFamily: 'monospace', padding: '2px 5px', borderRadius: 2, letterSpacing: '0.08em' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1a1815', lineHeight: 1.3, marginBottom: 2 }}>{product.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(52,49,51,0.45)' }}>${product.price.toFixed(0)}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── CMSEditor (main) ──────────────────────────────────────────────────────────
export default function CMSEditor({ sections }: { sections: PageSection[] }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
  const [view, setView] = useState<'sections' | 'picker'>('sections')
  const [iframeReady, setIframeReady] = useState(false)
  const [, startTransition] = useTransition()
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Products for the picker
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)

  // Get current slot assignments from indumentaria section
  const indumentariaSection = sections.find(s => s.section_key === 'indumentaria')
  const currentSlots = ((indumentariaSection?.content as Record<string, unknown>)?.product_slots ?? {}) as Record<string, string | null>

  // Listen for postMessage from iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.av_cms_click) {
        const { section, field, slot } = e.data.av_cms_click as { section: string; field: string; slot?: string }
        setActiveKey(section)
        setActiveField(field)
        // Product slot → open picker
        if (field === 'product_slot' && slot) {
          setActiveSlot(slot)
          setView('picker')
          if (!productsLoaded) {
            supabaseBrowser
              .from('products')
              .select('id,name,slug,price,images,category,active')
              .eq('active', true)
              .order('name')
              .then(({ data }) => {
                setProducts((data as Product[]) ?? [])
                setProductsLoaded(true)
              })
          }
        } else {
          setView('sections')
          const card = cardRefs.current[section]
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
        return
      }
      // Section-level click (fallback)
      if (e.data?.av_cms_section) {
        const key = e.data.av_cms_section as string
        setActiveKey(key)
        setActiveField(null)
        setView('sections')
        const card = cardRefs.current[key]
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsLoaded])

  // After iframe loads, inject click interceptors (same-origin)
  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    setIframeReady(true)

    const doc = iframe.contentDocument

    // CSS: hover effect on editable elements
    const style = doc.createElement('style')
    style.textContent = `
      [data-cms-s] { cursor: pointer !important; outline: none; transition: outline 0.1s; }
      [data-cms-s]:hover { outline: 2px solid rgba(201,168,112,0.6) !important; outline-offset: 2px; }
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

    // Field-level click handlers (including product slots)
    const fieldEls = doc.querySelectorAll<HTMLElement>('[data-cms-s][data-cms-f]')
    fieldEls.forEach(el => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        window.parent.postMessage({
          av_cms_click: {
            section: el.getAttribute('data-cms-s'),
            field: el.getAttribute('data-cms-f'),
            slot: el.getAttribute('data-cms-slot') ?? undefined,
          }
        }, '*')
      }, { capture: true })
    })

    // Section-level click handlers (for sections without a specific field target)
    Object.entries(ID_TO_KEY).forEach(([domId, sectionKey]) => {
      const el = doc.getElementById(domId)
      if (!el) return
      el.setAttribute('data-cms-section', sectionKey)
      el.addEventListener('click', (ev) => {
        // Only fire if not already handled by a field-level element
        const target = ev.target as HTMLElement
        if (target.closest('[data-cms-s][data-cms-f]')) return
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
                · Toca un elemento para editar
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

      {/* Right: section editors OR product picker */}
      <div style={{ flex: 1, overflow: 'hidden', background: '#F7F4F1', display: 'flex', flexDirection: 'column' }}>
        {view === 'picker' && activeSlot ? (
          <ProductPicker
            activeSlot={activeSlot}
            sectionId={indumentariaSection?.id ?? null}
            currentSlots={currentSlots}
            products={products}
            onBack={() => { setView('sections'); setActiveSlot(null) }}
            onAssign={(slotKey, productId) => {
              if (!indumentariaSection?.id) return
              startTransition(async () => {
                await assignProductSlot(indumentariaSection.id, slotKey, productId)
                reloadIframe()
              })
            }}
          />
        ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
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
          flexShrink: 0,
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
                activeField={activeKey === section.section_key ? activeField : null}
                cardRef={el => { cardRefs.current[section.section_key] = el }}
              />
            ))
          )}
        </div>
        </div>
        )}
      </div>
    </div>
  )
}
