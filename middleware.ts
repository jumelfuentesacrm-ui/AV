import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const BETA_BYPASS   = ['/access', '/api/access', '/api/auth', '/auth', '/admin']
const AUTH_REQUIRED = ['/account', '/admin', '/api/auth/redirect']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Beta access gate — skip for bypassed paths
  const isBypassed = BETA_BYPASS.some((p) => pathname.startsWith(p))
  const hasAccess  = request.cookies.get('av_access')?.value === '1'

  if (!isBypassed && !hasAccess) {
    const url = request.nextUrl.clone()
    url.pathname = '/access'
    return NextResponse.redirect(url)
  }

  // Only hit Supabase on routes that actually need a session
  const needsAuth = AUTH_REQUIRED.some((p) => pathname.startsWith(p))
  if (!needsAuth) return NextResponse.next()

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
