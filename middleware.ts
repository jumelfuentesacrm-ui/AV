import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = ['/access', '/api/access', '/api/auth', '/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isBypassed = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const hasAccess = request.cookies.get('av_access')?.value === '1'

  if (!isBypassed && !hasAccess) {
    const url = request.nextUrl.clone()
    url.pathname = '/access'
    return NextResponse.redirect(url)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
