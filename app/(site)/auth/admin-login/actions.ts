'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function adminLoginAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Correo y contraseña requeridos.' }
  }

  const supabase = createClient()

  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError || !data.user) {
    return { error: 'Las puertas del archivo permanecen cerradas.' }
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = profile?.role ?? 'none'

  if (role !== 'admin' && role !== 'employee') {
    return { error: `Acceso denegado. Rol actual: ${role}.` }
  }

  redirect('/admin')
}
