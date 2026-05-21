'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(
  _prev: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email      = formData.get('email')    as string
  const password   = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  if (!email || !password) {
    return { error: 'Correo y contraseña requeridos.' }
  }

  const supabase = createClient()

  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError || !data.user) {
    return { error: signInError?.message ?? 'Credenciales incorrectas.' }
  }

  if (redirectTo) {
    redirect(redirectTo)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = profile?.role ?? 'customer'

  if (role === 'admin' || role === 'employee') {
    redirect('/admin')
  } else {
    redirect('/account')
  }
}
