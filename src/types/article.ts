export type Category =
  | 'Industry News'
  | 'Investor News'
  | 'Government News'
  | 'Sponsor News'
  | 'Opinions'
  | 'International'

export type Region = 'US' | 'Europe' | 'UK' | 'Australia' | 'Other'

export type ArticleStatus = 'New' | 'Reviewed' | 'Featured' | 'Rejected' | 'Archived'

export type AddedBy =
  | 'Simone'
  | 'Manual'
  | 'AI Candidate'
  | 'Newsletter'
  | 'Browser Extension'
  | 'Other'

export type SVDGRelevanceLevel = 'High' | 'Medium' | 'Low'

export type SourceQualityLevel = 'High' | 'Medium' | 'Low'

export type Workstream =
  | 'NatSec100'
  | 'Policy'
  | 'Industry Council'
  | 'Event Briefing'
  | 'Sponsor Engagement'
  | 'Newsletter'
  | 'International / Australia'
  | 'Capital Formation'

export type SponsorNatSec100Relevance = 'Direct' | 'Ecosystem' | 'None'

export interface ScoreBreakdown {
  recency: number
  svdgRelevance: number
  sourceQuality: number
  workstreamRelevance: number
  sponsorNatSec100: number
}

export interface Article {
  id: string
  title: string
  url: string
  source: string
  author?: string
  datePublished: string        // ISO date string
  dateAdded: string            // ISO date string
  categories: Category[]
  tags: string[]
  shortDescription: string
  whyItMatters?: string
  relevanceScore: number       // 0–100
  scoreBreakdown?: ScoreBreakdown
  isScoreOverridden: boolean
  originalCalculatedScore?: number
  status: ArticleStatus
  region?: Region
  sponsorName?: string
  companyMentions: string[]
  addedBy: AddedBy
  isArchived: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string

  // Score inputs (stored for recalculation)
  svdgRelevanceLevel: SVDGRelevanceLevel
  sourceQualityLevel: SourceQualityLevel
  workstreams: Workstream[]
  sponsorNatSec100Relevance: SponsorNatSec100Relevance
}

export interface ArticleFormData {
  title: string
  url: string
  source: string
  author: string
  datePublished: string
  categories: Category[]
  tags: string[]
  shortDescription: string
  whyItMatters: string
  region?: Region
  sponsorName: string
  companyMentions: string
  status: ArticleStatus
  isFeatured: boolean
  svdgRelevanceLevel: SVDGRelevanceLevel
  sourceQualityLevel: SourceQualityLevel
  workstreams: Workstream[]
  sponsorNatSec100Relevance: SponsorNatSec100Relevance
  addedBy: AddedBy
  manualScoreOverride?: number
}
