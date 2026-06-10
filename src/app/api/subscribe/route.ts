import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber } from '@/lib/subscribers'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const source = typeof body?.source === 'string' ? body.source : undefined

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const { alreadySubscribed } = addSubscriber(email, source)
    return NextResponse.json({ ok: true, alreadySubscribed }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
