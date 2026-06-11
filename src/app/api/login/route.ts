import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE, computeAuthToken, safeRedirectTarget } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')
  const redirectTarget = safeRedirectTarget(String(formData.get('redirect') ?? ''))

  const siteUsername = process.env.SITE_USERNAME || 'svdg'
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword || username !== siteUsername || password !== sitePassword) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', '1')
    if (redirectTarget !== '/') {
      loginUrl.searchParams.set('redirect', redirectTarget)
    }
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  const token = await computeAuthToken(siteUsername, sitePassword)
  const response = NextResponse.redirect(new URL(redirectTarget, request.url), { status: 303 })
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  })
  return response
}
