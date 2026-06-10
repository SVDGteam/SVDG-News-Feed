import { Article } from '@/types/article'
import { getEffectiveScore, getScoreLabel } from './scoring'
import { WeeklyDigest } from './newsletter'

// SVDG / Dispatch design tokens (mirrors globals.css / tailwind.config.ts)
const COLORS = {
  bg: '#031020',       // svdg-pea-coat
  card: '#0b1c33',
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',
  white: '#ffffff',
  french: '#a8a9ac',   // svdg-french-gray
  sky: '#75fb9f',      // svdg-sky-dancer
  blue: '#2177e8',     // svdg-crayola
  yellow: '#fbbf24',
  low: '#1c2c44',
}

// Live site, used for absolute asset URLs (email clients can't load local paths)
const SITE_URL = 'https://svdg-news-feed.vercel.app'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Mirrors getScoreColor() in scoring.ts (bg-x/15 text-x-300 border-x-400/30
// translucent badges), with hex/rgba equivalents for email clients.
function scoreBadge(score: number): { label: string; bg: string; fg: string; border: string } {
  const tier = getScoreLabel(score)
  switch (tier) {
    case 'High':
      return { label: 'HIGH', bg: COLORS.sky, fg: COLORS.bg, border: COLORS.sky }
    case 'Medium-High':
      return { label: 'MED-HIGH', bg: 'rgba(59,130,246,0.18)', fg: '#93c5fd', border: 'rgba(96,165,250,0.4)' }
    case 'Medium':
      return { label: 'MEDIUM', bg: 'rgba(234,179,8,0.18)', fg: '#fde047', border: 'rgba(250,204,21,0.4)' }
    default:
      return { label: 'LOW', bg: 'rgba(255,255,255,0.06)', fg: '#94a3b8', border: 'rgba(255,255,255,0.12)' }
  }
}

function renderStory(article: Article, isLast: boolean): string {
  const score = getEffectiveScore(article)
  const badge = scoreBadge(score)
  const meta = [...article.categories, article.source].map((s) => s.toUpperCase()).join(' · ')
  const url = escapeHtml(article.url)

  return `
            <tr>
              <td style="padding: 16px 28px${isLast ? ' 24px 28px' : ''};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="display:inline-block; background-color:${badge.bg}; color:${badge.fg}; border:1px solid ${badge.border}; font-family:'Courier New',monospace; font-size:10px; font-weight:700; letter-spacing:1px; border-radius:4px; padding:2px 6px; margin-bottom:6px;">SCORE ${score} · ${badge.label}</span>
                      <span style="display:inline-block; font-family:'Courier New',monospace; font-size:10px; letter-spacing:1px; color:${COLORS.french}; margin-left:6px;">${escapeHtml(meta)}</span>
                      <h2 style="margin:8px 0 6px 0; font-size:17px; line-height:1.35; color:${COLORS.white}; font-weight:700;">
                        <a href="${url}" style="color:${COLORS.white}; text-decoration:none;">${escapeHtml(article.title)}</a>
                      </h2>
                      <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:${COLORS.french};">
                        ${escapeHtml(article.shortDescription)}
                      </p>
                      <a href="${url}" style="font-family:'Courier New',monospace; font-size:11px; letter-spacing:1px; color:${COLORS.sky}; text-decoration:none;">READ MORE →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>${isLast ? '' : `
            <tr><td style="padding:0 28px;"><div style="border-top:1px solid ${COLORS.divider};"></div></td></tr>`}`
}

export interface NewsletterEmail {
  subject: string
  html: string
  text: string
}

export function buildNewsletterEmail(digest: WeeklyDigest): NewsletterEmail {
  const { articles, weekStr } = digest

  const storiesHtml = articles.length
    ? articles.map((a, i) => renderStory(a, i === articles.length - 1)).join('\n')
    : `
            <tr>
              <td style="padding: 16px 28px 24px 28px; text-align:center; color:${COLORS.french}; font-size:13px;">
                No stories from the past week yet — check back soon.
              </td>
            </tr>`

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>The Weekly Rundown — ${escapeHtml(weekStr)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${COLORS.bg}; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;" bgcolor="${COLORS.bg}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};" bgcolor="${COLORS.bg}">
      <tr>
        <td align="center" style="padding: 32px 16px;" bgcolor="${COLORS.bg}">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:${COLORS.card}; border:1px solid ${COLORS.border}; border-radius:12px; overflow:hidden;" bgcolor="${COLORS.card}">

            <!-- Header -->
            <tr>
              <td style="padding: 28px 28px 0 28px; text-align:center;" bgcolor="${COLORS.card}">
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                  <tr>
                    <td style="background-color:#ffffff; border-radius:10px; padding:10px; vertical-align:middle;" bgcolor="#ffffff">
                      <img src="${SITE_URL}/brand/logomark-color.png" width="34" height="36" alt="SVDG" style="display:block; border:0; outline:none;" />
                    </td>
                    <td style="padding-left:12px; text-align:left; vertical-align:middle;">
                      <div style="font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-weight:700; font-size:24px; color:${COLORS.white}; line-height:1;">
                        Dispatch<span style="display:inline-block; width:6px; height:18px; background-color:${COLORS.sky}; margin-left:6px; vertical-align:middle;">&nbsp;</span>
                      </div>
                      <div style="font-family: 'Courier New', monospace; font-size:10px; letter-spacing:2px; color:${COLORS.sky}; margin-top:5px;">AN SVDG PRODUCT</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:18px; font-family: 'Courier New', monospace; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:${COLORS.sky};">Newsletter</div>
                <h1 style="margin:8px 0 8px 0; font-size:30px; line-height:1.2; color:${COLORS.white}; font-weight:700;">The Weekly Rundown</h1>
                <div style="font-family: 'Courier New', monospace; font-size:11px; letter-spacing:1px; color:${COLORS.french}; margin-bottom: 8px;">${escapeHtml(weekStr)}</div>
                <p style="font-size:14px; line-height:1.6; color:${COLORS.french}; max-width:480px; margin: 12px auto 0 auto;">
                  The same scored, curated intelligence the SVDG team reads in Dispatch — top stories
                  across industry, investor, government, sponsor, and international defense-tech news.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 24px 28px 8px 28px;" bgcolor="${COLORS.card}">
                <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; font-family: 'Courier New', monospace; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:${COLORS.white}; font-weight:700;">
                  This Week's Top Stories
                </div>
              </td>
            </tr>
${storiesHtml}

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 28px; border-top:1px solid ${COLORS.border}; text-align:center;" bgcolor="${COLORS.card}">
                <p style="margin:0 0 6px 0; font-family:'Courier New',monospace; font-size:10px; letter-spacing:1px; color:${COLORS.french};">
                  DISPATCH — AN SVDG PRODUCT
                </p>
                <p style="margin:0; font-size:11px; color:#5b6573;">
                  You're receiving this because you signed up for the Weekly Rundown at Silicon Valley Defense Group.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const text = [
    `THE WEEKLY RUNDOWN — ${weekStr}`,
    '',
    'The same scored, curated intelligence the SVDG team reads in Dispatch.',
    '',
    'THIS WEEK\'S TOP STORIES',
    '',
    ...articles.flatMap((a) => [
      `[${getEffectiveScore(a)}] ${a.title}`,
      a.shortDescription,
      a.url,
      '',
    ]),
    '— Dispatch, a SVDG product',
  ].join('\n')

  return {
    subject: `The Weekly Rundown — ${weekStr}`,
    html,
    text,
  }
}
