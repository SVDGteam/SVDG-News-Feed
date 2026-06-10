/**
 * Auto-fill helpers for articles clipped via the browser extension.
 *
 * When a team member clips a page, that act of choosing to save it is
 * itself a form of review — they've already judged it relevant to SVDG.
 * So instead of dropping every extension submission into "Needs Review"
 * with generic Medium/Medium/no-workstream defaults (which tanks the
 * score and creates busywork), we:
 *
 *  - mark it `status: 'Reviewed'` right away
 *  - default `svdgRelevanceLevel` to 'High' (a person chose this — that's
 *    worth more than an AI guess), which is the main relevance score boost
 *  - look up the source against known high-quality outlets/think tanks/
 *    official sources (see src/data/sources.ts) for `sourceQualityLevel`
 *  - infer `workstreams` and `sponsorNatSec100Relevance` from the chosen
 *    categories and whether the source is an SVDG sponsor
 *  - guess `region` from the domain's country TLD
 *
 * Team members can still edit any of these afterward — this just means
 * a clipped article shows up fully scored and "Reviewed" out of the box.
 */

import { Category, Region, SourceQualityLevel, SponsorNatSec100Relevance, Workstream } from '@/types/article'
import { SPONSORS } from '@/data/sponsors'

// Domains for the "Priority 1/2" high-signal outlets, official sources, and
// think tanks in src/data/sources.ts. Matching here (or a subdomain of one
// of these) bumps sourceQualityLevel to 'High'.
const HIGH_QUALITY_DOMAINS = [
  // US defense policy & industry press
  'politico.com',
  'breakingdefense.com',
  'defensenews.com',
  'defenseone.com',
  'warontherocks.com',
  // Official / government
  'defense.gov',
  'dod.mil',
  'diu.mil',
  'darpa.mil',
  'nato.int',
  'gov.uk',
  'defence.gov.au',
  'eda.europa.eu',
  // Think tanks
  'csis.org',
  'cnas.org',
  'scsp.ai',
  'rand.org',
  'hudson.org',
  'atlanticcouncil.org',
  'understandingwar.org',
  'iiss.org',
  'rusi.org',
  'aspistrategist.org.au',
  // Major business / financial press
  'wsj.com',
  'bloomberg.com',
  'ft.com',
  'reuters.com',
  'axios.com',
  'theinformation.com',
  // Domain trade press
  'spacenews.com',
  'c4isrnet.com',
  'nationaldefensemagazine.org',
  'airandspaceforces.com',
  'news.usni.org',
  // Newsletters / trackers
  'tectonic.io',
  'pryzm.io',
  'payloadspace.com',
  'punchbowl.news',
]

const SPONSOR_DOMAINS = SPONSORS.map((s) => s.website.replace(/^www\./, ''))

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`)
}

function isHighQualitySource(host: string): boolean {
  return HIGH_QUALITY_DOMAINS.some((d) => hostMatches(host, d))
}

function isSponsorSource(host: string): boolean {
  return SPONSOR_DOMAINS.some((d) => hostMatches(host, d))
}

// Categories the team picks map fairly directly onto a workstream.
const CATEGORY_WORKSTREAM: Partial<Record<Category, Workstream>> = {
  'Sponsor News': 'Sponsor Engagement',
  International: 'International / Australia',
  'Investor News': 'Capital Formation',
  'Government News': 'Policy',
}

function detectWorkstreams(categories: Category[], sponsorMatch: boolean): Workstream[] {
  const workstreams = new Set<Workstream>()
  for (const c of categories) {
    const ws = CATEGORY_WORKSTREAM[c]
    if (ws) workstreams.add(ws)
  }
  if (sponsorMatch) workstreams.add('NatSec100')
  return Array.from(workstreams)
}

function detectSponsorNatSec100(categories: Category[], sponsorMatch: boolean): SponsorNatSec100Relevance {
  if (sponsorMatch || categories.includes('Sponsor News')) return 'Direct'
  return 'None'
}

function detectRegion(host: string): Region | undefined {
  if (host.endsWith('.uk')) return 'UK'
  if (host.endsWith('.au')) return 'Australia'
  if (host.endsWith('.eu') || host.endsWith('.int') || host.endsWith('eda.europa.eu')) return 'Europe'
  return undefined
}

export interface ExtensionEnrichment {
  sourceQualityLevel: SourceQualityLevel
  workstreams: Workstream[]
  sponsorNatSec100Relevance: SponsorNatSec100Relevance
  region: Region | undefined
}

/** `host` should be a normalized hostname (no protocol, no leading "www."). */
export function enrichExtensionSubmission(host: string, categories: Category[]): ExtensionEnrichment {
  const sponsorMatch = isSponsorSource(host)

  return {
    sourceQualityLevel: isHighQualitySource(host) ? 'High' : 'Medium',
    workstreams: detectWorkstreams(categories, sponsorMatch),
    sponsorNatSec100Relevance: detectSponsorNatSec100(categories, sponsorMatch),
    region: detectRegion(host),
  }
}
