/**
 * Sponsor roster "database" adapter.
 *
 * src/data/sponsors.ts holds the base SVDG sponsor roster — committed to
 * git and bundled with every deploy. Vercel's runtime filesystem is
 * read-only, so live edits (adding/removing sponsors from the dashboard)
 * can't modify that file directly in production.
 *
 * Instead, live edits go to a small "overlay" stored in Upstash Redis
 * (same KV connection as db.ts):
 *   - added:   sponsors added live, not yet in src/data/sponsors.ts
 *   - removed: names of sponsors (base or added) hidden live
 *
 * getAllSponsors() merges the base list + overlay on every read. This
 * mirrors the pattern in src/lib/db.ts.
 *
 * If KV_REST_API_URL/KV_REST_API_TOKEN aren't set (local development),
 * the overlay falls back to data/sponsors-overlay.json.
 */

import fs from 'fs'
import path from 'path'
import { Sponsor, SPONSORS } from '@/data/sponsors'
import { hasKV, kvGetJSON, kvSetJSON } from '@/lib/kv'

const OVERLAY_PATH = path.join(process.cwd(), 'data', 'sponsors-overlay.json')
const OVERLAY_KEY = 'dispatch:sponsors-overlay'

interface SponsorOverlay {
  added: Sponsor[]
  removed: string[]
}

function emptyOverlay(): SponsorOverlay {
  return { added: [], removed: [] }
}

// ── File-based overlay (local dev fallback) ────────────────────────────────
function readFileOverlay(): SponsorOverlay {
  if (!fs.existsSync(OVERLAY_PATH)) return emptyOverlay()
  try {
    const raw = fs.readFileSync(OVERLAY_PATH, 'utf-8')
    return { ...emptyOverlay(), ...JSON.parse(raw) }
  } catch {
    return emptyOverlay()
  }
}

function writeFileOverlay(overlay: SponsorOverlay): void {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(OVERLAY_PATH, JSON.stringify(overlay, null, 2))
}

// ── KV-based overlay ─────────────────────────────────────────────────────
async function loadOverlay(): Promise<SponsorOverlay> {
  if (!hasKV()) return readFileOverlay()
  const overlay = await kvGetJSON<SponsorOverlay>(OVERLAY_KEY)
  return overlay ? { ...emptyOverlay(), ...overlay } : emptyOverlay()
}

async function saveOverlay(overlay: SponsorOverlay): Promise<void> {
  if (!hasKV()) {
    writeFileOverlay(overlay)
    return
  }
  await kvSetJSON(OVERLAY_KEY, overlay)
}

function mergeSponsors(overlay: SponsorOverlay): Sponsor[] {
  const removed = new Set(overlay.removed.map((n) => n.toLowerCase()))
  const merged = [...SPONSORS, ...overlay.added].filter(
    (s) => !removed.has(s.name.toLowerCase())
  )
  return merged.sort((a, b) => a.name.localeCompare(b.name))
}

// ── Read all ───────────────────────────────────────────────────────────────
export async function getAllSponsors(): Promise<Sponsor[]> {
  const overlay = await loadOverlay()
  return mergeSponsors(overlay)
}

// ── Add ────────────────────────────────────────────────────────────────────
export async function addSponsor(sponsor: Sponsor): Promise<Sponsor[]> {
  const name = sponsor.name.trim()
  const website = sponsor.website.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')

  if (!name || !website) {
    throw new Error('Sponsor name and website are required')
  }

  const overlay = await loadOverlay()
  const current = mergeSponsors(overlay)

  if (current.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A sponsor with this name already exists')
  }

  // If this name was previously removed, un-remove it instead of duplicating.
  overlay.removed = overlay.removed.filter((n) => n.toLowerCase() !== name.toLowerCase())
  overlay.added.push({ name, website })

  await saveOverlay(overlay)
  return mergeSponsors(overlay)
}

// ── Remove ─────────────────────────────────────────────────────────────────
export async function removeSponsor(name: string): Promise<Sponsor[]> {
  const overlay = await loadOverlay()

  // If it was added live, just drop it from `added`.
  const addedIdx = overlay.added.findIndex((s) => s.name.toLowerCase() === name.toLowerCase())
  if (addedIdx !== -1) {
    overlay.added.splice(addedIdx, 1)
  }

  // Otherwise (or also), mark it removed so it's hidden from the base list.
  if (!overlay.removed.some((n) => n.toLowerCase() === name.toLowerCase())) {
    overlay.removed.push(name)
  }

  await saveOverlay(overlay)
  return mergeSponsors(overlay)
}

// ── Sponsor domains (for grading/relevance logic) ──────────────────────────
export async function getSponsorDomains(): Promise<string[]> {
  const sponsors = await getAllSponsors()
  return sponsors.map((s) => s.website.replace(/^www\./, ''))
}

// ── Sponsor names (for dropdowns/filters) ──────────────────────────────────
export async function getSponsorNames(): Promise<string[]> {
  const sponsors = await getAllSponsors()
  return sponsors.map((s) => s.name).sort((a, b) => a.localeCompare(b))
}
