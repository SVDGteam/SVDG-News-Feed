import { NextRequest, NextResponse } from 'next/server'
import { getAllSponsors, addSponsor, removeSponsor } from '@/lib/sponsors'

export const dynamic = 'force-dynamic'

// Sponsor roster CRUD for the dashboard's "Edit roster" panel on /sponsor.
// Sits behind the same Basic Auth gate as the rest of the dashboard
// (see src/middleware.ts) — no separate secret needed.

export async function GET() {
  const sponsors = await getAllSponsors()
  return NextResponse.json(sponsors)
}

export async function POST(req: NextRequest) {
  let body: { name?: string; website?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  const website = (body.website || '').trim()

  if (!name || !website) {
    return NextResponse.json({ error: 'name and website are required' }, { status: 400 })
  }

  try {
    const sponsors = await addSponsor({ name, website })
    return NextResponse.json(sponsors, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add sponsor'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  let body: { name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const sponsors = await removeSponsor(name)
  return NextResponse.json(sponsors)
}
