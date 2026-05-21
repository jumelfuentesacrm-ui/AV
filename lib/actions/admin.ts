'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/* ============================================================
   PAGE SECTIONS (CMS)
   ============================================================ */
export async function updateSection(id: string, data: { label?: string; content?: Record<string,unknown>; visible?: boolean; order_index?: number }) {
  const supabase = createClient()
  await supabase.from('page_sections').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/cms')
  revalidatePath('/')
}

/* ============================================================
   PRODUCTS
   ============================================================ */
export async function updateProduct(id: string, data: Record<string,unknown>) {
  const supabase = createClient()
  await supabase.from('products').update(data).eq('id', id)
  revalidatePath('/admin/merch')
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/admin/merch')
}

export async function bulkUpdatePrices(updates: { id: string; price: number }[]) {
  const supabase = createClient()
  await Promise.all(updates.map(({ id, price }) =>
    supabase.from('products').update({ price }).eq('id', id)
  ))
  revalidatePath('/admin/merch')
}

/* ============================================================
   ORDERS
   ============================================================ */
export async function updateOrderStatus(id: string, status: string) {
  const supabase = createClient()
  await supabase.from('orders').update({ status }).eq('id', id)
  revalidatePath('/admin/orders')
}

/* ============================================================
   USERS / EMPLOYEES
   ============================================================ */
export async function updateUserRole(id: string, role: string) {
  const supabase = createClient()
  await supabase.from('profiles').update({ role }).eq('id', id)
  if (role === 'employee') {
    await supabase.from('employee_permissions').upsert({ user_id: id }, { onConflict: 'user_id' })
  }
  revalidatePath('/admin/employees')
  revalidatePath('/admin/users')
}

export async function updateEmployeePermission(userId: string, field: string, value: boolean) {
  const supabase = createClient()
  await supabase.from('employee_permissions')
    .upsert({ user_id: userId, [field]: value, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  revalidatePath('/admin/employees')
}

/* ============================================================
   CATALOGS
   ============================================================ */
export async function createCatalog(formData: FormData) {
  const supabase = createClient()
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const description = formData.get('description') as string
  await supabase.from('catalogs').insert({ name, slug, description })
  revalidatePath('/admin/catalogs')
}

export async function updateCatalog(id: string, data: Record<string,unknown>) {
  const supabase = createClient()
  await supabase.from('catalogs').update(data).eq('id', id)
  revalidatePath('/admin/catalogs')
}

export async function deleteCatalog(id: string) {
  const supabase = createClient()
  await supabase.from('catalogs').delete().eq('id', id)
  revalidatePath('/admin/catalogs')
}

export async function addProductToCatalog(catalogId: string, productId: string) {
  const supabase = createClient()
  const { data: last } = await supabase.from('catalog_products').select('display_order').eq('catalog_id', catalogId).order('display_order', { ascending: false }).limit(1).single()
  const nextOrder = (last?.display_order ?? -1) + 1
  await supabase.from('catalog_products').insert({ catalog_id: catalogId, product_id: productId, display_order: nextOrder })
  revalidatePath('/admin/catalogs')
}

export async function removeProductFromCatalog(catalogId: string, productId: string) {
  const supabase = createClient()
  await supabase.from('catalog_products').delete().eq('catalog_id', catalogId).eq('product_id', productId)
  revalidatePath('/admin/catalogs')
}

/* ============================================================
   SITE SETTINGS
   ============================================================ */
export async function saveSiteSettings(key: string, value: Record<string,unknown>) {
  const supabase = createClient()
  await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  revalidatePath('/')
  revalidatePath('/admin/settings')
}

/* ============================================================
   MACHINE LOCATIONS
   ============================================================ */
export async function updateMachine(id: string, data: Record<string,unknown>) {
  const supabase = createClient()
  await supabase.from('machine_locations').update(data).eq('id', id)
  revalidatePath('/admin/machines')
}

export async function createMachine(formData: FormData) {
  const supabase = createClient()
  await supabase.from('machine_locations').insert({
    mall_name: formData.get('mall_name'),
    address:   formData.get('address'),
    city:      formData.get('city'),
    hours:     formData.get('hours'),
    active:    false,
  })
  revalidatePath('/admin/machines')
}
