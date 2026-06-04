import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, buildSessionToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value
  const pin = process.env.ADMIN_PIN ?? ''
  const secret = process.env.ADMIN_SECRET ?? ''
  const expected = buildSessionToken(pin, secret)

  if (session !== expected) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
