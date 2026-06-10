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

    const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL

    // Production: write to the "Weekly Rundown Subscribers" Google Sheet via an
    // Apps Script web app (Vercel's filesystem is read-only, so we can't use
    // the local JSON store there). See docs/NEWSLETTER_SETUP.md.
    if (sheetWebhookUrl) {
      const sheetRes = await fetch(sheetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          source: source ?? '',
          timestamp: new Date().toISOString(),
        }),
        // Apps Script web apps can be slow to wake up — give it a moment.
        signal: AbortSignal.timeout(10000),
      })

      if (!sheetRes.ok) {
        throw new Error(`Sheet webhook responded with ${sheetRes.status}`)
      }

      const data = await sheetRes.json().catch(() => ({}))
      return NextResponse.json({ ok: true, alreadySubscribed: !!data.alreadySubscribed }, { status: 201 })
    }

    // Local dev fallback: JSON file in data/subscribers.json
    const { alreadySubscribed } = addSubscriber(email, source)
    return NextResponse.json({ ok: true, alreadySubscribed }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
