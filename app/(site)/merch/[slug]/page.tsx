'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import StarburstLogo from '@/components/ui/StarburstLogo'
import { useCart } from '@/context/CartContext'
import { calculatePoints } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single()

      if (!productData) {
        setLoading(false)
        return
      }

      const { data: variantData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id)

      setProduct(productData as Product)
      setVariants((variantData as ProductVariant[]) ?? [])
      setLoading(false)
    }
    fetchProduct()
  }, [slug, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-16">
        <StarburstLogo size={48} color="#C9A870" className="animate-spin opacity-50" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center pt-16 gap-4">
        <p className="font-display font-bold text-2xl tracking-wider uppercase text-charcoal/40">
          Producto no encontrado
        </p>
        <Link href="/merch" className="font-body text-sm text-gold underline">
          Volver a la colección
        </Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : []
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[]
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[]
  const pointsPreview = calculatePoints(product.price * quantity)

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="min-h-screen bg-cream pt-20">
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-xs font-body tracking-widest uppercase text-charcoal/40">
            <Link href="/merch" className="hover:text-gold transition-colors duration-200">Ropa</Link>
            <span>/</span>
            <span className="text-charcoal">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <div>
              <div className="relative aspect-[4/5] bg-charcoal mb-3 overflow-hidden">
                {images[activeImage] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <StarburstLogo size={80} color="#C9A870" className="opacity-20" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative w-16 aspect-square overflow-hidden border-2 transition-colors duration-200 ${
                        i === activeImage ? 'border-charcoal' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              {product.category && (
                <span className="font-body text-xs text-gold tracking-widest uppercase mb-2">
                  {product.category === 'shirt' ? 'Camisa'
                    : product.category === 'tshirt' ? 'T-Shirt'
                    : product.category === 'accessory' ? 'Accesorio'
                    : 'Otro'}
                </span>
              )}
              <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-wider uppercase mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="font-body text-3xl font-medium text-charcoal mb-6">
                ${product.price.toFixed(2)}
              </p>

              {product.description && (
                <p className="font-body text-charcoal/60 text-sm leading-relaxed mb-8 max-w-md">
                  {product.description}
                </p>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="font-body text-xs tracking-widest uppercase text-charcoal/50 mb-3">Talla</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const variantForSize = variants.find(
                        (v) => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color)
                      )
                      const inStock = (variantForSize?.stock ?? 0) > 0
                      const isSelected = selectedVariant?.size === size
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            const v = variants.find((v) => v.size === size) ?? null
                            setSelectedVariant(v)
                          }}
                          disabled={!inStock}
                          className={`font-display font-bold text-sm tracking-wider uppercase px-4 py-2 border transition-colors duration-200 ${
                            !inStock
                              ? 'border-charcoal/10 text-charcoal/20 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-charcoal text-cream border-charcoal'
                              : 'border-charcoal/30 hover:border-charcoal'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Colors */}
              {colors.length > 0 && (
                <div className="mb-8">
                  <p className="font-body text-xs tracking-widest uppercase text-charcoal/50 mb-3">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const isSelected = selectedVariant?.color === color
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            const v = variants.find(
                              (v) => v.color === color && (!selectedVariant?.size || v.size === selectedVariant.size)
                            ) ?? null
                            setSelectedVariant(v)
                          }}
                          className={`font-display font-bold text-sm tracking-wider uppercase px-4 py-2 border transition-colors duration-200 ${
                            isSelected
                              ? 'bg-charcoal text-cream border-charcoal'
                              : 'border-charcoal/30 hover:border-charcoal'
                          }`}
                        >
                          {color}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <p className="font-body text-xs tracking-widest uppercase text-charcoal/50">Cantidad</p>
                <div className="flex items-center border border-charcoal/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-charcoal/5 transition-colors"
                  >
                    <span className="font-body text-lg leading-none">−</span>
                  </button>
                  <span className="w-10 text-center font-body text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-charcoal/5 transition-colors"
                  >
                    <span className="font-body text-lg leading-none">+</span>
                  </button>
                </div>
              </div>

              {/* Points preview */}
              <div className="flex items-center gap-2 mb-8 text-charcoal/40">
                <span className="text-gold text-sm">★</span>
                <span className="font-body text-xs tracking-wider">
                  Ganarás <strong className="text-gold">{pointsPreview.toFixed(2)} puntos</strong> con esta compra
                </span>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full font-display font-bold text-sm tracking-widest uppercase py-4 transition-all duration-300 ${
                  added
                    ? 'bg-gold text-dark'
                    : 'bg-charcoal text-cream hover:bg-dark'
                }`}
              >
                {added ? '¡Añadido al Carrito! ✓' : 'Añadir al Carrito'}
              </button>

              {/* Stock notice */}
              {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                <p className="font-body text-xs text-gold mt-3 tracking-wider">
                  ¡Solo quedan {selectedVariant.stock} unidades!
                </p>
              )}
              {selectedVariant && selectedVariant.stock === 0 && (
                <p className="font-body text-xs text-charcoal/40 mt-3 tracking-wider">
                  Agotado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
