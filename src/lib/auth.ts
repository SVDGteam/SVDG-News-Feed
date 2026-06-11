// Shared helpers for the site-wide login gate (see middleware.ts).
//
// Uses the Web Crypto API (`crypto.subtle`) so the same code runs in both
// the Edge middleware runtime and the Node runtime used by API routes.

export const AUTH_COOKIE_NAME = 'svdg_auth'

// One year — this is a shared "front door" credential, not a per-user
// session, so a long-lived cookie (and a saved password) is the point.
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export async function computeAuthToken(username: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${username}:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Only allow same-site, path-absolute redirect targets (e.g. "/archive"),
// never an absolute URL or protocol-relative one — avoids open redirects.
export function safeRedirectTarget(target: string | null | undefined): string {
  if (!target) return '/'
  if (!target.startsWith('/') || target.startsWith('//')) return '/'
  return target
}
