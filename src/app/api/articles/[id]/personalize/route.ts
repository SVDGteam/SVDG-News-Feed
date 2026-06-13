import { NextRequest, NextResponse } from 'next/server'
import { setPersonalState } from '@/lib/db'

interface Params { params: { id: string } }

interface PersonalizeBody {
  userId?: string
  read?: boolean
  shortlisted?: boolean
}

// POST { userId, read?: boolean, shortlisted?: boolean }
// Updates one team member's personal state on an article — marking it
// read/unread and/or adding/removing it from their reading list.
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const body: PersonalizeBody = await req.json()
    const { userId, read, shortlisted } = body

    if (!userId || !userId.trim()) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    if (read === undefined && shortlisted === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const updated = await setPersonalState(params.id, userId, { read, shortlisted })
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[api/articles/[id]/personalize POST]', err)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}
