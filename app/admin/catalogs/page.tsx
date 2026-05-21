import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Catalog, Product } from '@/types'

export const revalidate = 0

async function getCatalogs(): Promise<(Catalog & { product_count: number })[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('catalogs')
    .select('*, catalog_products(count)')
    .order('display_order', { ascending: true })

  return ((data as unknown as (Catalog & { catalog_products: { count: number }[] })[]) ?? []).map((c) => ({
    ...c,
    product_count: c.catalog_products?.[0]?.count ?? 0,
  }))
}

async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, price, active, images')
    .eq('active', true)
    .order('name', { ascending: true })
  return (data as Product[]) ?? []
}

async function getCatalogProducts(catalogId: string): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('catalog_products')
    .select('product_id')
    .eq('catalog_id', catalogId)
  return (data ?? []).map((r: { product_id: string }) => r.product_id)
}

async function createCatalog(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  if (!name || !slug) return
  const supabase = createClient()
  await supabase.from('catalogs').insert({ name, slug, description: description || null })
  revalidatePath('/admin/catalogs')
}

async function toggleCatalogVisible(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const visible = formData.get('visible') === 'true'
  const supabase = createClient()
  await supabase.from('catalogs').update({ visible: !visible }).eq('id', id)
  revalidatePath('/admin/catalogs')
}

async function moveCatalogUp(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const currentOrder = Number(formData.get('display_order'))
  if (currentOrder <= 0) return
  const supabase = createClient()
  const { data: above } = await supabase
    .from('catalogs')
    .select('id, display_order')
    .eq('display_order', currentOrder - 1)
    .single()
  if (above) {
    await supabase.from('catalogs').update({ display_order: currentOrder - 1 }).eq('id', id)
    await supabase.from('catalogs').update({ display_order: currentOrder }).eq('id', (above as { id: string }).id)
  }
  revalidatePath('/admin/catalogs')
}

async function moveCatalogDown(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const currentOrder = Number(formData.get('display_order'))
  const supabase = createClient()
  const { data: below } = await supabase
    .from('catalogs')
    .select('id, display_order')
    .eq('display_order', currentOrder + 1)
    .single()
  if (below) {
    await supabase.from('catalogs').update({ display_order: currentOrder + 1 }).eq('id', id)
    await supabase.from('catalogs').update({ display_order: currentOrder }).eq('id', (below as { id: string }).id)
  }
  revalidatePath('/admin/catalogs')
}

async function deleteCatalog(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = createClient()
  await supabase.from('catalogs').delete().eq('id', id)
  revalidatePath('/admin/catalogs')
}

async function saveCatalogProducts(formData: FormData) {
  'use server'
  const catalogId = formData.get('catalog_id') as string
  const productIds = formData.getAll('product_ids[]') as string[]
  const supabase = createClient()
  await supabase.from('catalog_products').delete().eq('catalog_id', catalogId)
  if (productIds.length > 0) {
    await supabase.from('catalog_products').insert(
      productIds.map((pid, idx) => ({
        catalog_id: catalogId,
        product_id: pid,
        display_order: idx,
      }))
    )
  }
  revalidatePath('/admin/catalogs')
}

const inputStyle = {
  width: '100%',
  border: '1px solid rgba(0,0,0,0.12)',
  padding: '0.5rem 0.75rem',
  fontFamily: 'var(--f-sans)',
  fontSize: '0.875rem',
  background: '#FAF5F0',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--f-mono)',
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color: '#6B6560',
  marginBottom: '0.4rem',
}

const btnDark = {
  background: '#1a1815',
  color: '#FAF5F0',
  border: 'none',
  padding: '0.5rem 1.5rem',
  fontFamily: 'var(--f-display)',
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
}

export default async function AdminCatalogsPage({
  searchParams,
}: {
  searchParams: { catalog?: string }
}) {
  const catalogs = await getCatalogs()
  const allProducts = await getAllProducts()

  const editingCatalogId = searchParams.catalog ?? null
  const editingCatalog = editingCatalogId
    ? catalogs.find((c) => c.id === editingCatalogId)
    : null
  const assignedProductIds = editingCatalogId
    ? await getCatalogProducts(editingCatalogId)
    : []

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
          Catálogos
        </h1>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'rgba(26,24,21,0.4)', marginTop: '0.25rem' }}>
          {catalogs.length} catálogos · Agrupa productos para mostrarlos en colecciones
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: editingCatalogId ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* Left column: catalog list + create form */}
        <div>
          {/* Create new catalog */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                background: '#1a1815',
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--f-display)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#FAF5F0',
                }}
              >
                + Nuevo Catálogo
              </span>
            </div>
            <form action={createCatalog}>
              <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Nombre *</label>
                  <input name="name" required style={inputStyle} placeholder="Colección Verano" />
                </div>
                <div>
                  <label style={labelStyle}>Slug *</label>
                  <input name="slug" required style={inputStyle} placeholder="coleccion-verano" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Descripción</label>
                  <input name="description" style={inputStyle} placeholder="Descripción opcional..." />
                </div>
              </div>
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={btnDark}>Crear Catálogo</button>
              </div>
            </form>
          </div>

          {/* Catalog list */}
          {catalogs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 0',
                border: '1px solid rgba(0,0,0,0.08)',
                fontFamily: 'var(--f-sans)',
                color: 'rgba(26,24,21,0.4)',
              }}
            >
              No hay catálogos aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {catalogs.map((catalog, index) => (
                <div
                  key={catalog.id}
                  style={{
                    background: '#FFFFFF',
                    border: editingCatalogId === catalog.id
                      ? '1px solid rgba(201,168,112,0.5)'
                      : '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1.25rem',
                      background: catalog.visible ? '#1a1815' : '#6B6560',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#C9A870', fontFamily: 'var(--f-mono)', fontSize: '0.65rem' }}>
                        #{catalog.display_order + 1}
                      </span>
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
                        {catalog.name}
                      </span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', color: 'rgba(250,245,240,0.4)' }}>
                        {catalog.product_count} productos
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {index > 0 && (
                        <form action={moveCatalogUp} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={catalog.id} />
                          <input type="hidden" name="display_order" value={catalog.display_order} />
                          <button type="submit" style={{ background: 'rgba(250,245,240,0.08)', border: '1px solid rgba(250,245,240,0.15)', color: 'rgba(250,245,240,0.6)', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.75rem' }}>↑</button>
                        </form>
                      )}
                      {index < catalogs.length - 1 && (
                        <form action={moveCatalogDown} style={{ display: 'inline' }}>
                          <input type="hidden" name="id" value={catalog.id} />
                          <input type="hidden" name="display_order" value={catalog.display_order} />
                          <button type="submit" style={{ background: 'rgba(250,245,240,0.08)', border: '1px solid rgba(250,245,240,0.15)', color: 'rgba(250,245,240,0.6)', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.75rem' }}>↓</button>
                        </form>
                      )}
                      <form action={toggleCatalogVisible} style={{ display: 'inline' }}>
                        <input type="hidden" name="id" value={catalog.id} />
                        <input type="hidden" name="visible" value={String(catalog.visible)} />
                        <button
                          type="submit"
                          style={{
                            background: catalog.visible ? 'rgba(201,168,112,0.2)' : 'rgba(250,245,240,0.08)',
                            border: `1px solid ${catalog.visible ? 'rgba(201,168,112,0.5)' : 'rgba(250,245,240,0.15)'}`,
                            color: catalog.visible ? '#C9A870' : 'rgba(250,245,240,0.4)',
                            padding: '0 0.75rem',
                            height: '28px',
                            cursor: 'pointer',
                            fontFamily: 'var(--f-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {catalog.visible ? '● Visible' : '○ Oculto'}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--f-sans)', fontSize: '0.8rem', color: 'rgba(26,24,21,0.5)' }}>
                      {catalog.description ?? <em>Sin descripción</em>}
                    </span>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <a
                        href={`/admin/catalogs?catalog=${catalog.id}`}
                        style={{
                          fontFamily: 'var(--f-mono)',
                          fontSize: '0.65rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#C9A870',
                          textDecoration: 'none',
                        }}
                      >
                        Gestionar productos →
                      </a>
                      <form action={deleteCatalog} style={{ display: 'inline' }}>
                        <input type="hidden" name="id" value={catalog.id} />
                        <button
                          type="submit"
                          style={{
                            background: 'none',
                            border: 'none',
                            fontFamily: 'var(--f-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'rgba(220,38,38,0.7)',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          onClick={(e) => {
                            if (!confirm('¿Eliminar este catálogo?')) e.preventDefault()
                          }}
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: product assignment */}
        {editingCatalogId && editingCatalog && (
          <div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(201,168,112,0.4)',
              }}
            >
              <div
                style={{
                  background: '#1a1815',
                  padding: '0.875rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--f-display)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#FAF5F0',
                  }}
                >
                  Productos — {editingCatalog.name}
                </span>
                <a
                  href="/admin/catalogs"
                  style={{
                    fontFamily: 'var(--f-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(250,245,240,0.4)',
                    textDecoration: 'none',
                  }}
                >
                  ✕ Cerrar
                </a>
              </div>

              <form action={saveCatalogProducts}>
                <input type="hidden" name="catalog_id" value={editingCatalogId} />
                <div style={{ padding: '1rem 1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
                  <p style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '0.75rem' }}>
                    Selecciona los productos que pertenecen a este catálogo:
                  </p>
                  {allProducts.map((product) => {
                    const isAssigned = assignedProductIds.includes(product.id)
                    return (
                      <label
                        key={product.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.625rem 0',
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          name="product_ids[]"
                          value={product.id}
                          defaultChecked={isAssigned}
                          style={{ width: '16px', height: '16px', accentColor: '#C9A870' }}
                        />
                        <div>
                          <span style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: '#1a1815', fontWeight: 500 }}>
                            {product.name}
                          </span>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', color: '#6B6560', marginLeft: '0.5rem' }}>
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                  {allProducts.length === 0 && (
                    <p style={{ fontFamily: 'var(--f-sans)', fontSize: '0.875rem', color: 'rgba(26,24,21,0.4)', textAlign: 'center', padding: '2rem 0' }}>
                      No hay productos activos disponibles.
                    </p>
                  )}
                </div>
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={btnDark}>Guardar selección</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
