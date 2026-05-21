import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = 'AV_VOL_0.1_BETA'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password === PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('av_access', '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
