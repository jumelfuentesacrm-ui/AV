import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const url   = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return response

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/account') && !user) {
    const dest = request.nextUrl.clone()
    dest.pathname = '/auth/login'
    dest.searchParams.set('redirect', pathname)
    return NextResponse.redirect(dest)
  }

  if (pathname.startsWith('/admin') && !user) {
    const dest = request.nextUrl.clone()
    dest.pathname = '/auth/login'
    dest.searchParams.set('redirect', pathname)
    return NextResponse.redirect(dest)
  }

  return response
}
