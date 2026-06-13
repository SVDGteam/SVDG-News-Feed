import { NextRequest, NextResponse } from 'next/server'
import { getWeeklyDigest } from '@/lib/newsletter'
import { buildNewsletterEmail } from '@/lib/newsletterEmail'

export const dynamic = 'force-dynamic'

// Returns the current weekly digest as a ready-to-send email
// ({ subject, html, text }). Called by the Apps Script weekly sender
// (see docs/NEWSLETTER_SETUP.md) so it doesn't need to duplicate the
// scoring/ranking logic.
//
// Protected by a shared secret (NEWSLETTER_DIGEST_SECRET) passed as
// ?key=... — this endpoint exposes (slightly) more than the public
// /newsletter page (raw URLs, full descriptions for all 6 stories) and
// is meant only for the Apps Script integration.
export async function GET(req: NextRequest) {
  const secret = process.env.NEWSLETTER_DIGEST_SECRET
  const key = req.nextUrl.searchParams.get('key')

  if (!secret || key !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const digest = await getWeeklyDigest(6)
  const email = buildNewsletterEmail(digest)

  return NextResponse.json(email)
}
