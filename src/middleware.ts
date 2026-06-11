import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, computeAuthToken } from '@/lib/auth'

// Optional shared-password gate for a future public deployment.
//
// Disabled by default. To enable, set SITE_PASSWORD (and optionally
// SITE_USERNAME, default "svdg") in the environment. When set, every
// request must present a valid session cookie (set by /login after a
// correct username/password) or get redirected to the in-site /login page.
// This is meant as a lightweight "front door" for a public site — not a
// substitute for per-user accounts if/when individual logins are needed.
export async function middleware(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD

  // No password configured -> app remains open (current internal usage).
  if (!sitePassword) {
    return NextResponse.next()
  }

  const siteUsername = process.env.SITE_USERNAME || 'svdg'
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const expectedToken = await computeAuthToken(siteUsername, sitePassword)

  if (cookieToken === expectedToken) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  const target = `${request.nextUrl.pathname}${request.nextUrl.search}`
  if (target && target !== '/') {
    loginUrl.searchParams.set('redirect', target)
  }
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - static assets (_next, favicon, fonts, brand, extension downloads)
     *  - the login page + its API route (must stay reachable while logged out)
     *  - the public newsletter signup page + its API route
     *  - integration endpoints that use their own shared-secret auth
     *    (Apps Script newsletter sender, browser extension)
     * so the gate covers the dashboard and its other API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|fonts|brand|extension/dispatch-clipper.zip|login|api/login|newsletter|api/subscribe|api/newsletter/digest|api/extension).*)',
  ],
}
