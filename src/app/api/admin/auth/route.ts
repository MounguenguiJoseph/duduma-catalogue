import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, buildSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  const adminPin = process.env.ADMIN_PIN ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''

  if (pin !== adminPin) {
    return NextResponse.json({ error: 'PIN incorrect' }, { status: 401 })
  }

  const token = buildSessionToken(adminPin, secret)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
