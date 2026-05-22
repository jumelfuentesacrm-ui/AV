export const dynamic = 'force-dynamic'

import HomeClient from '@/components/home/HomeClient'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Film, Product, MachineLocation, PageSection } from '@/types'

async function getData() {
  const supabase = createClient()
  const supa  = createServiceClient()
  const [filmsRes, productsRes, machinesRes, sectionsRes] = await Promise.all([
    supabase.from('films').select('*').eq('featured', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('products').select('*, product_variants(*)').eq('featured', true).eq('active', true).limit(8),
    supabase.from('machine_locations').select('*').eq('active', true).order('created_at'),
    supa.from('page_sections').select('*').order('order_index', { ascending: true }),
  ])

  const sections = (sectionsRes.data ?? []) as PageSection[]
  const content: Record<string, Record<string, string>> = {}
  sections.forEach(s => { content[s.section_key] = (s.content as Record<string, string>) ?? {} })

  return {
    films:    (filmsRes.data    ?? []) as Film[],
    products: (productsRes.data ?? []) as Product[],
    machines: (machinesRes.data ?? []) as MachineLocation[],
    content,
  }
}

export default async function HomePage() {
  const { films, products, machines, content } = await getData()
  return <HomeClient films={films} products={products} machines={machines} content={content} />
}
