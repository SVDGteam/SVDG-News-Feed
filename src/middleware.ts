import { NextRequest, NextResponse } from 'next/server'

// Optional shared-password gate for a future public deployment.
//
// Disabled by default. To enable, set SITE_PASSWORD (and optionally
// SITE_USERNAME, default "svdg") in the environment. When set, every
// request must present HTTP Basic Auth credentials matching those values.
// This is meant as a lightweight "front door" for a public site — not a
// substitute for per-user accounts if/when individual logins are needed.
export function middleware(request: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD

  // No password configured -> app remains open (current internal usage).
  if (!sitePassword) {
    return NextResponse.next()
  }

  const siteUsername = process.env.SITE_USERNAME || 'svdg'
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.split(' ')[1] ?? '', 'base64').toString()
    const [user, pass] = decoded.split(':')
    if (user === siteUsername && pass === sitePassword) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Dispatch"' },
  })
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - static assets (_next, favicon, fonts, brand, extension downloads)
     *  - the public newsletter signup page + its API route
     *  - integration endpoints that use their own shared-secret auth
     *    (Apps Script newsletter sender, browser extension) — these can't
     *    answer an HTTP Basic Auth challenge.
     * so the gate covers the dashboard and its other API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|fonts|brand|extension/dispatch-clipper.zip|newsletter|api/subscribe|api/newsletter/digest|api/extension).*)',
  ],
}
