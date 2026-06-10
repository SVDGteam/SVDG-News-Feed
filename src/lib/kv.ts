/**
 * Tiny Upstash Redis REST client (no SDK dependency — just fetch).
 *
 * When a project's "dispatch-db" Upstash database is connected on Vercel,
 * `KV_REST_API_URL` and `KV_REST_API_TOKEN` are added automatically. When
 * those aren't set (e.g. local development), `hasKV()` returns false and
 * callers should fall back to the file-based store in db.ts.
 */

const BASE_URL = process.env.KV_REST_API_URL
const TOKEN = process.env.KV_REST_API_TOKEN

export function hasKV(): boolean {
  return !!BASE_URL && !!TOKEN
}

async function command(...args: (string | number)[]): Promise<unknown> {
  if (!BASE_URL || !TOKEN) {
    throw new Error('Upstash KV is not configured (missing KV_REST_API_URL/KV_REST_API_TOKEN)')
  }

  const url = `${BASE_URL}/${args.map((a) => encodeURIComponent(String(a))).join('/')}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Upstash request failed: ${res.status} ${await res.text()}`)
  }

  const data = (await res.json()) as { result: unknown }
  return data.result
}

/** Get a JSON value stored at `key`, or `null` if unset. */
export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const result = await command('get', key)
  if (result === null || result === undefined) return null
  try {
    return JSON.parse(result as string) as T
  } catch {
    return null
  }
}

/** Store a JSON value at `key`. */
export async function kvSetJSON(key: string, value: unknown): Promise<void> {
  // Upstash REST API: POST/GET {base}/set/{key}/{value} — value must be a
  // single path segment, so we encode the JSON string.
  await command('set', key, JSON.stringify(value))
}
