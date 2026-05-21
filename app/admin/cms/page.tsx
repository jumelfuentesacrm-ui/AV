import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PageSection } from '@/types'

export const revalidate = 0

async function getSections(): Promise<PageSection[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('*')
    .order('order_index', { ascending: true })
  return (data as PageSection[]) ?? []
}

async function toggleSectionVisible(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const visible = formData.get('visible') === 'true'
  const supabase = createClient()
  await supabase.from('page_sections').update({ visible: !visible }).eq('id', id)
  revalidatePath('/admin/cms')
}

async function moveSectionUp(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const currentIndex = Number(formData.get('order_index'))
  if (currentIndex <= 0) return
  const supabase = createClient()
  const { data: above } = await supabase
    .from('page_sections')
    .select('id, order_index')
    .eq('order_index', currentIndex - 1)
    .single()
  if (above) {
    await supabase.from('page_sections').update({ order_index: currentIndex - 1 }).eq('id', id)
    await supabase.from('page_sections').update({ order_index: currentIndex }).eq('id', above.id)
  }
  revalidatePath('/admin/cms')
}

async function moveSectionDown(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const currentIndex = Number(formData.get('order_index'))
  const supabase = createClient()
  const { data: below } = await supabase
    .from('page_sections')
    .select('id, order_index')
    .eq('order_index', currentIndex + 1)
    .single()
  if (below) {
    await supabase.from('page_sections').update({ order_index: currentIndex + 1 }).eq('id', id)
    await supabase.from('page_sections').update({ order_index: currentIndex }).eq('id', below.id)
  }
  revalidatePath('/admin/cms')
}

async function updateSectionContent(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const label = formData.get('label') as string
  const title = formData.get('title') as string
  const subtitle = formData.get('subtitle') as string
  const body = formData.get('body') as string
  const button_text = formData.get('button_text') as string
  const button_href = formData.get('button_href') as string

  const supabase = createClient()
  const { data: existing } = await supabase
    .from('page_sections')
    .select('content')
    .eq('id', id)
    .single()

  const currentContent = (existing?.content as Record<string, unknown>) ?? {}
  const updatedContent: Record<string, unknown> = { ...currentContent }
  if (title !== null && title !== undefined) updatedContent.title = title
  if (subtitle !== null && subtitle !== undefined) updatedContent.subtitle = subtitle
  if (body !== null && body !== undefined) updatedContent.body = body
  if (button_text !== null && button_text !== undefined) updatedContent.button_text = button_text
  if (button_href !== null && button_href !== undefined) updatedContent.button_href = button_href

  await supabase
    .from('page_sections')
    .update({ label, content: updatedContent })
    .eq('id', id)
  revalidatePath('/admin/cms')
}

function SectionCard({ section, isFirst, isLast }: { section: PageSection; isFirst: boolean; isLast: boolean }) {
  const content = section.content as Record<string, string>

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.08)',
        marginBottom: '1rem',
        opacity: section.visible ? 1 : 0.6,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: section.visible ? '#1a1815' : '#6B6560',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#C9A870', fontSize: '0.7rem', fontFamily: 'var(--f-mono)' }}>
            #{section.order_index + 1}
          </span>
          <span
            style={{
              color: '#FAF5F0',
              fontFamily: 'var(--f-display)',
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {section.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: '0.65rem',
              color: 'rgba(250,245,240,0.4)',
              letterSpacing: '0.05em',
            }}
          >
            {section.section_key}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Move Up */}
          {!isFirst && (
            <form action={moveSectionUp}>
              <input type="hidden" name="id" value={section.id} />
              <input type="hidden" name="order_index" value={section.order_index} />
              <button
                type="submit"
                style={{
                  background: 'rgba(250,245,240,0.08)',
                  border: '1px solid rgba(250,245,240,0.15)',
                  color: 'rgba(250,245,240,0.6)',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
                title="Mover arriba"
              >
                ↑
              </button>
            </form>
          )}

          {/* Move Down */}
          {!isLast && (
            <form action={moveSectionDown}>
              <input type="hidden" name="id" value={section.id} />
              <input type="hidden" name="order_index" value={section.order_index} />
              <button
                type="submit"
                style={{
                  background: 'rgba(250,245,240,0.08)',
                  border: '1px solid rgba(250,245,240,0.15)',
                  color: 'rgba(250,245,240,0.6)',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
                title="Mover abajo"
              >
                ↓
              </button>
            </form>
          )}

          {/* Toggle Visible */}
          <form action={toggleSectionVisible}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="visible" value={String(section.visible)} />
            <button
              type="submit"
              style={{
                background: section.visible ? 'rgba(201,168,112,0.2)' : 'rgba(250,245,240,0.08)',
                border: `1px solid ${section.visible ? 'rgba(201,168,112,0.5)' : 'rgba(250,245,240,0.15)'}`,
                color: section.visible ? '#C9A870' : 'rgba(250,245,240,0.4)',
                padding: '0 0.75rem',
                height: '28px',
                cursor: 'pointer',
                fontFamily: 'var(--f-mono)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {section.visible ? '● Visible' : '○ Oculto'}
            </button>
          </form>
        </div>
      </div>

      {/* Edit Form */}
      <form action={updateSectionContent}>
        <input type="hidden" name="id" value={section.id} />
        <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.4rem' }}>
              Etiqueta de sección
            </label>
            <input
              name="label"
              defaultValue={section.label}
              style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '0.5rem 0.75rem', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', background: '#FAF5F0', boxSizing: 'border-box' }}
            />
          </div>

          {'title' in content && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.4rem' }}>
                Título
              </label>
              <input
                name="title"
                defaultValue={content.title ?? ''}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '0.5rem 0.75rem', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', background: '#FAF5F0', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {'subtitle' in content && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.4rem' }}>
                Subtítulo
              </label>
              <input
                name="subtitle"
                defaultValue={content.subtitle ?? ''}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '0.5rem 0.75rem', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', background: '#FAF5F0', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {'body' in content && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.4rem' }}>
                Texto principal
              </label>
              <textarea
                name="body"
                defaultValue={content.body ?? ''}
                rows={3}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '0.5rem 0.75rem', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', background: '#FAF5F0', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {'button_text' in content && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.4rem' }}>
                Texto del botón
              </label>
              <input
                name="button_text"
                defaultValue={content.button_text ?? ''}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '0.5rem 0.75rem', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', background: '#FAF5F0', boxSizing: 'border-box' }}
              />
            </div>
          )}

          {'button_href' in content && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.4rem' }}>
                URL del botón
              </label>
              <input
                name="button_href"
                defaultValue={content.button_href ?? ''}
                style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', padding: '0.5rem 0.75rem', fontFamily: 'var(--f-sans)', fontSize: '0.875rem', background: '#FAF5F0', boxSizing: 'border-box' }}
              />
            </div>
          )}
        </div>

        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              background: '#1a1815',
              color: '#FAF5F0',
              border: 'none',
              padding: '0.5rem 1.5rem',
              fontFamily: 'var(--f-display)',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}

export default async function AdminCMSPage() {
  const sections = await getSections()

  return (
    <div style={{ padding: '2rem' }}>
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
          Editor de Contenido
        </h1>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'rgba(26,24,21,0.4)', marginTop: '0.25rem' }}>
          {sections.length} secciones · Edita el contenido de cada sección del sitio
        </p>
      </div>

      <div>
        {sections.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 0',
              border: '1px solid rgba(0,0,0,0.08)',
              fontFamily: 'var(--f-sans)',
              color: 'rgba(26,24,21,0.4)',
            }}
          >
            No hay secciones configuradas.
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
            />
          ))
        )}
      </div>
    </div>
  )
}
