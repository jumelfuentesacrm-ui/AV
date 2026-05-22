'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function toggleSectionVisible(id: string, visible: boolean) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('page_sections').update({ visible: !visible }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function moveSectionUp(id: string, currentIndex: number) {
  if (currentIndex <= 0) return
  const supabase = createServiceClient()
  const { data: above } = await supabase
    .from('page_sections')
    .select('id, order_index')
    .eq('order_index', currentIndex - 1)
    .single()
  if (above) {
    await supabase.from('page_sections').update({ order_index: currentIndex - 1 }).eq('id', id)
    await supabase.from('page_sections').update({ order_index: currentIndex }).eq('id', above.id)
  }
  revalidatePath('/')
}

export async function moveSectionDown(id: string, currentIndex: number) {
  const supabase = createServiceClient()
  const { data: below } = await supabase
    .from('page_sections')
    .select('id, order_index')
    .eq('order_index', currentIndex + 1)
    .single()
  if (below) {
    await supabase.from('page_sections').update({ order_index: currentIndex + 1 }).eq('id', id)
    await supabase.from('page_sections').update({ order_index: currentIndex }).eq('id', below.id)
  }
  revalidatePath('/')
}

export async function updateSectionContent(
  id: string,
  label: string,
  fields: Record<string, string>
) {
  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from('page_sections')
    .select('content')
    .eq('id', id)
    .single()
  const current = (existing?.content as Record<string, unknown>) ?? {}
  const updated = { ...current, ...fields }
  const { error } = await supabase.from('page_sections').update({ label, content: updated }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function assignProductSlot(
  sectionId: string,
  slotKey: string,
  productId: string | null
) {
  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from('page_sections')
    .select('content')
    .eq('id', sectionId)
    .single()
  const current = (existing?.content as Record<string, unknown>) ?? {}
  const currentSlots = (current.product_slots as Record<string, string | null>) ?? {}
  const { error } = await supabase
    .from('page_sections')
    .update({ content: { ...current, product_slots: { ...currentSlots, [slotKey]: productId } } })
    .eq('id', sectionId)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}
