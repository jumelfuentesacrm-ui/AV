'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import StarburstLogo from '@/components/ui/StarburstLogo'
import { slugify } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'

const EMPTY_PRODUCT: Partial<Product> = {
  name: '',
  slug: '',
  description: '',
  category: 'shirt',
  price: 0,
  images: [],
  featured: false,
  active: true,
}

export default function AdminMerchPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [editingVariants, setEditingVariants] = useState<Partial<ProductVariant>[]>([])
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [imagesInput, setImagesInput] = useState('')
  const supabase = createClient()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const openEdit = (product?: Product) => {
    if (product) {
      setEditing(product)
      setImagesInput((product.images ?? []).join('\n'))
      setEditingVariants(product.variants ?? [])
    } else {
      setEditing({ ...EMPTY_PRODUCT })
      setImagesInput('')
      setEditingVariants([])
    }
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)

    const images = imagesInput.split('\n').map((s) => s.trim()).filter(Boolean)
    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name ?? ''),
      description: editing.description,
      category: editing.category,
      price: Number(editing.price),
      images,
      featured: editing.featured ?? false,
      active: editing.active ?? true,
    }

    let productId = editing.id
    if (productId) {
      await supabase.from('products').update(payload).eq('id', productId)
    } else {
      const { data } = await supabase.from('products').insert(payload).select().single()
      productId = (data as Product)?.id
    }

    // Save variants
    if (productId) {
      // Delete existing and re-insert
      await supabase.from('product_variants').delete().eq('product_id', productId)
      const validVariants = editingVariants.filter((v) => v.size || v.color)
      if (validVariants.length > 0) {
        await supabase.from('product_variants').insert(
          validVariants.map((v) => ({
            product_id: productId,
            size: v.size || null,
            color: v.color || null,
            stock: Number(v.stock ?? 0),
            sku: v.sku || null,
          }))
        )
      }
    }

    setSaving(false)
    setEditing(null)
    fetchProducts()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setDeleteId(null)
    fetchProducts()
  }

  const addVariantRow = () => {
    setEditingVariants([...editingVariants, { size: '', color: '', stock: 0, sku: '' }])
  }

  const updateVariant = (i: number, key: string, value: string | number) => {
    const updated = [...editingVariants]
    updated[i] = { ...updated[i], [key]: value }
    setEditingVariants(updated)
  }

  const removeVariant = (i: number) => {
    setEditingVariants(editingVariants.filter((_, idx) => idx !== i))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-wider uppercase text-charcoal">
          Productos
        </h1>
        <button
          onClick={() => openEdit()}
          className="bg-dark text-cream font-display font-bold text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-charcoal transition-colors duration-200"
        >
          + Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <StarburstLogo size={40} color="#C9A870" className="animate-spin opacity-50" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-charcoal/10">
          <p className="font-body text-charcoal/40">No hay productos aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10">
                {['Producto', 'Categoría', 'Precio', 'Variantes', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left font-body text-xs tracking-widest uppercase text-charcoal/40 pb-3 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0]} alt="" className="w-10 h-10 object-cover bg-charcoal/10" />
                      ) : (
                        <div className="w-10 h-10 bg-charcoal/10 flex items-center justify-center">
                          <StarburstLogo size={16} color="#C9A870" className="opacity-30" />
                        </div>
                      )}
                      <div>
                        <p className="font-display font-bold text-sm tracking-wide uppercase">{product.name}</p>
                        <p className="font-body text-xs text-charcoal/40">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-body text-sm text-charcoal/60 capitalize">{product.category ?? '—'}</td>
                  <td className="py-4 pr-4 font-body text-sm font-medium">${product.price.toFixed(2)}</td>
                  <td className="py-4 pr-4 font-body text-sm text-charcoal/50">{product.variants?.length ?? 0}</td>
                  <td className="py-4 pr-4">
                    <span className={`font-display font-bold text-xs tracking-wider uppercase px-2 py-0.5 ${product.active ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/40'}`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(product)}
                        className="font-body text-xs text-gold hover:text-charcoal transition-colors duration-200 uppercase tracking-wider"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
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
                {editing.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setEditing(null)} className="text-charcoal/40 hover:text-charcoal text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre *">
                  <input
                    type="text"
                    value={editing.name ?? ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: slugify(e.target.value) })}
                    className="admin-input"
                  />
                </Field>
                <Field label="Precio ($) *">
                  <input
                    type="number"
                    value={editing.price ?? 0}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="admin-input"
                    min={0}
                    step={0.01}
                  />
                </Field>
              </div>
              <Field label="Slug">
                <input
                  type="text"
                  value={editing.slug ?? ''}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="admin-input"
                />
              </Field>
              <Field label="Categoría">
                <select
                  value={editing.category ?? 'shirt'}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as Product['category'] })}
                  className="admin-input"
                >
                  <option value="shirt">Camisa (Shirt)</option>
                  <option value="tshirt">T-Shirt</option>
                  <option value="accessory">Accesorio</option>
                  <option value="other">Otro</option>
                </select>
              </Field>
              <Field label="Descripción">
                <textarea
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={4}
                  className="admin-input resize-none"
                />
              </Field>
              <Field label="URLs de imágenes (una por línea)">
                <textarea
                  value={imagesInput}
                  onChange={(e) => setImagesInput(e.target.value)}
                  rows={3}
                  className="admin-input resize-none"
                  placeholder="https://imagen1.com/foto.jpg&#10;https://imagen2.com/foto.jpg"
                />
              </Field>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.active ?? true}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="font-body text-sm">Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.featured ?? false}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="font-body text-sm">Destacado</span>
                </label>
              </div>

              {/* Variants */}
              <div className="border-t border-charcoal/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-sm tracking-wider uppercase">Variantes</h3>
                  <button
                    onClick={addVariantRow}
                    className="font-body text-xs text-gold tracking-wider uppercase hover:text-charcoal transition-colors duration-200"
                  >
                    + Añadir variante
                  </button>
                </div>
                {editingVariants.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 mb-1">
                      {['Talla', 'Color', 'Stock', ''].map((h) => (
                        <span key={h} className="font-body text-[10px] text-charcoal/40 tracking-widest uppercase">{h}</span>
                      ))}
                    </div>
                    {editingVariants.map((v, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 items-center">
                        <input
                          type="text"
                          value={v.size ?? ''}
                          onChange={(e) => updateVariant(i, 'size', e.target.value)}
                          placeholder="S, M, L..."
                          className="admin-input text-sm"
                        />
                        <input
                          type="text"
                          value={v.color ?? ''}
                          onChange={(e) => updateVariant(i, 'color', e.target.value)}
                          placeholder="Negro, Blanco..."
                          className="admin-input text-sm"
                        />
                        <input
                          type="number"
                          value={v.stock ?? 0}
                          onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                          min={0}
                          className="admin-input text-sm"
                        />
                        <button
                          onClick={() => removeVariant(i)}
                          className="text-red-400 hover:text-red-600 text-lg font-body transition-colors duration-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-charcoal/10">
              <button
                onClick={handleSave}
                disabled={saving || !editing.name}
                className="bg-dark text-cream font-display font-bold text-xs tracking-widest uppercase px-8 py-3 hover:bg-charcoal transition-colors duration-200 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="border border-charcoal/20 font-display font-bold text-xs tracking-widest uppercase px-6 py-3"
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
            <p className="font-display font-bold text-lg tracking-wider uppercase mb-2">¿Eliminar producto?</p>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-body text-xs tracking-widest uppercase text-charcoal/50 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
