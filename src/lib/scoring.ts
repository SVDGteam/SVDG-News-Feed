import {
  SVDGRelevanceLevel,
  SourceQualityLevel,
  Workstream,
  SponsorNatSec100Relevance,
  ScoreBreakdown,
} from '@/types/article'

// ── Recency score (0–30) ────────────────────────────────────────────────────
export function calcRecencyScore(datePublished: string): number {
  const published = new Date(datePublished)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays <= 2) return 30
  if (diffDays <= 7) return 25
  if (diffDays <= 30) return 15
  if (diffDays <= 60) return 5
  return 0
}

// ── SVDG relevance score (0–35) ────────────────────────────────────────────
export function calcSVDGRelevanceScore(level: SVDGRelevanceLevel): number {
  switch (level) {
    case 'High': return 35
    case 'Medium': return 20
    case 'Low': return 5
  }
}

// ── Source quality score (0–15) ────────────────────────────────────────────
export function calcSourceQualityScore(level: SourceQualityLevel): number {
  switch (level) {
    case 'High': return 15
    case 'Medium': return 8
    case 'Low': return 3
  }
}

// ── Workstream relevance score (0–10) ──────────────────────────────────────
export function calcWorkstreamScore(workstreams: Workstream[]): number {
  if (workstreams.length >= 2) return 10
  if (workstreams.length === 1) return 6
  return 0
}

// ── Sponsor / NatSec100 score (0–10) ──────────────────────────────────────
export function calcSponsorNatSec100Score(
  relevance: SponsorNatSec100Relevance
): number {
  switch (relevance) {
    case 'Direct': return 10
    case 'Ecosystem': return 5
    case 'None': return 0
  }
}

// ── Full score calculation ─────────────────────────────────────────────────
export interface ScoreInputs {
  datePublished: string
  svdgRelevanceLevel: SVDGRelevanceLevel
  sourceQualityLevel: SourceQualityLevel
  workstreams: Workstream[]
  sponsorNatSec100Relevance: SponsorNatSec100Relevance
}

export function calcRelevanceScore(inputs: ScoreInputs): {
  score: number
  breakdown: ScoreBreakdown
} {
  const breakdown: ScoreBreakdown = {
    recency: calcRecencyScore(inputs.datePublished),
    svdgRelevance: calcSVDGRelevanceScore(inputs.svdgRelevanceLevel),
    sourceQuality: calcSourceQualityScore(inputs.sourceQualityLevel),
    workstreamRelevance: calcWorkstreamScore(inputs.workstreams),
    sponsorNatSec100: calcSponsorNatSec100Score(inputs.sponsorNatSec100Relevance),
  }
  const score = Math.min(
    100,
    breakdown.recency +
      breakdown.svdgRelevance +
      breakdown.sourceQuality +
      breakdown.workstreamRelevance +
      breakdown.sponsorNatSec100
  )
  return { score, breakdown }
}

// ── Score label helpers ────────────────────────────────────────────────────
export type ScoreLabel = 'High' | 'Medium-High' | 'Medium' | 'Low'

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 85) return 'High'
  if (score >= 65) return 'Medium-High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (score >= 65) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}
