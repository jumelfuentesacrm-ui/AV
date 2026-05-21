export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import HomeClient from '@/components/home/HomeClient'
import { createClient } from '@/lib/supabase/server'
import type { Film, Product, MachineLocation } from '@/types'

async function getData() {
  const supabase = createClient()
  const [filmsRes, productsRes, machinesRes] = await Promise.all([
    supabase.from('films').select('*').eq('featured', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('products').select('*, product_variants(*)').eq('featured', true).eq('active', true).limit(8),
    supabase.from('machine_locations').select('*').eq('active', true).order('created_at'),
  ])
  return {
    films:    (filmsRes.data    ?? []) as Film[],
    products: (productsRes.data ?? []) as Product[],
    machines: (machinesRes.data ?? []) as MachineLocation[],
  }
}

export default async function HomePage() {
  const { films, products, machines } = await getData()
  return (
    <Suspense fallback={null}>
      <HomeClient films={films} products={products} machines={machines} />
    </Suspense>
  )
}
