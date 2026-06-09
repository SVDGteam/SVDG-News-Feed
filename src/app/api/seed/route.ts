import { NextResponse } from 'next/server'
import { resetToSeed } from '@/lib/db'

// Dev-only: POST /api/seed to reset the database to seed data
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  const articles = resetToSeed()
  return NextResponse.json({ reset: true, count: articles.length })
}
