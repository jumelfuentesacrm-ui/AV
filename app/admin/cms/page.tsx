export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import CMSEditor from './CMSEditor'
import type { PageSection } from '@/types'

export default async function AdminCMSPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('page_sections')
    .select('*')
    .order('order_index', { ascending: true })
  const sections = (data as PageSection[]) ?? []

  return <CMSEditor sections={sections} />
}
