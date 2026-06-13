import { NextRequest, NextResponse } from 'next/server'
import { resetToSeed } from '@/lib/db'

// Guarded by SEED_RESET_SECRET — pass the value as `x-reset-key` header.
// NODE_ENV is always 'production' on Vercel (including previews), so it
// cannot be used as a reliable guard.
export async function POST(req: NextRequest) {
  const secret = process.env.SEED_RESET_SECRET
  if (!secret || req.headers.get('x-reset-key') !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const articles = await resetToSeed()
  return NextResponse.json({ reset: true, count: articles.length })
}
