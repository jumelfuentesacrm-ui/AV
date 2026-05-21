'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import StarburstLogo from '@/components/ui/StarburstLogo'
import type { Product } from '@/types'

type Category = 'all' | 'shirt' | 'tshirt' | 'accessory' | 'other'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'shirt', label: 'Camisas' },
  { value: 'tshirt', label: 'T-Shirts' },
  { value: 'accessory', label: 'Accesorios' },
  { value: 'other', label: 'Otros' },
]

export default function MerchPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      let query = supabase.from('products').select('*').eq('active', true)
      if (category !== 'all') {
        query = query.eq('category', category)
      }
      const { data } = await query.order('created_at', { ascending: false })
      setProducts((data as Product[]) ?? [])
      setLoading(false)
    }
    fetchProducts()
  }, [category, supabase])

  const filtered = products

  return (
    <>
      {/* Header */}
      <div className="bg-dark pt-32 pb-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <p className="font-body text-xs text-gold tracking-widest uppercase mb-3">División II</p>
          <h1 className="font-display font-extrabold text-cream tracking-wider uppercase"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.95 }}>
            La Colección
          </h1>
          <p className="font-body text-cream/50 text-base mt-4 max-w-lg leading-relaxed">
            Elegancia sin esfuerzo. Ropa diseñada para quienes viven el arte, no solo lo admiran.
          </p>
        </div>
      </div>

      <div className="bg-cream min-h-screen">
        <div className="max-w-screen-xl mx-auto px-6 py-12">

          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`flex-shrink-0 font-display font-bold text-sm tracking-widest uppercase px-5 py-2 transition-colors duration-200 ${
                  category === value
                    ? 'bg-charcoal text-cream'
                    : 'border border-charcoal/20 text-charcoal/60 hover:border-charcoal/60 hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-charcoal/10 mb-3" />
                  <div className="h-4 bg-charcoal/10 mb-2" />
                  <div className="h-3 bg-charcoal/10 w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <StarburstLogo size={60} color="#C9A870" className="mx-auto mb-6 opacity-30" />
              <p className="font-display font-bold text-2xl tracking-wider uppercase text-charcoal/40">
                {category === 'all' ? 'Colección en camino' : 'Sin productos en esta categoría'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ProductCard({ product }: { product: Product }) {
  const categoryLabel: Record<string, string> = {
    shirt: 'Camisa',
    tshirt: 'T-Shirt',
    accessory: 'Accesorio',
    other: 'Otro',
  }

  return (
    <Link href={`/merch/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-charcoal overflow-hidden mb-3">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <StarburstLogo size={40} color="#C9A870" className="opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
        )}
        {product.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-cream text-dark font-display font-bold text-[10px] tracking-widest uppercase px-2 py-0.5">
              {categoryLabel[product.category] ?? product.category}
            </span>
          </div>
        )}
      </div>
      <h3 className="font-display font-bold text-base tracking-wide uppercase leading-tight group-hover:text-gold transition-colors duration-200">
        {product.name}
      </h3>
      <p className="font-body text-sm text-gold mt-1">${product.price.toFixed(2)}</p>
    </Link>
  )
}
