import { NextRequest, NextResponse } from 'next/server'
import { setReaction } from '@/lib/db'
import { ReactionType } from '@/types/article'

interface Params { params: { id: string } }

interface ReactBody {
  userId?: string
  reaction?: ReactionType | null
}

// POST { userId, reaction: 'like' | 'dislike' | null }
// Sets (or clears, if reaction is null) one team member's vote on an
// article. Each like is worth +10 to the effective relevance score, each
// dislike -10 (see lib/scoring.ts getEffectiveScore).
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const body: ReactBody = await req.json()
    const { userId, reaction } = body

    if (!userId || !userId.trim()) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    if (reaction !== 'like' && reaction !== 'dislike' && reaction !== null) {
      return NextResponse.json({ error: 'reaction must be "like", "dislike", or null' }, { status: 400 })
    }

    const updated = setReaction(params.id, userId, reaction)
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}
