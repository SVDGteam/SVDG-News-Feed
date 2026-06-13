// Dispatch is mounted at /dispatch (see next.config.js `basePath`) when
// served behind the SVDG Hub's Vercel rewrites. next/link, next/image, and
// _next/static assets are automatically prefixed by Next.js — but raw
// fetch() calls, <form action>, <a href> to static files, and manual
// redirect()/NextResponse.redirect() URLs are NOT, so use these helpers for
// those cases.
export const BASE_PATH = '/dispatch'

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`
}
