import { Category, Region, Workstream } from '@/types/article'

export interface CategoryConfig {
  id: string
  label: Category
  slug: string
  description: string
  color: string
  bgColor: string
  heroImage: string
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'industry',
    label: 'Industry News',
    slug: 'industry',
    description:
      'Private-sector developments in the defense, dual-use, and national security technology ecosystem — startups, contracts, partnerships, and emerging tech.',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/15 border-blue-400/30',
    heroImage: '/brand/category-heroes/industry.jpg',
  },
  {
    id: 'investor',
    label: 'Investor News',
    slug: 'investor',
    description:
      'VC, PE, and institutional capital moving into defense and dual-use — fund announcements, exits, M&A, investment policy, and capital formation.',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/15 border-emerald-400/30',
    heroImage: '/brand/category-heroes/investor.jpg',
  },
  {
    id: 'government',
    label: 'Government News',
    slug: 'government',
    description:
      'Federal acquisition, DoD reform, innovation offices (DIU, DARPA, CDAO), Congressional action, NDAA, appropriations, and procurement policy.',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/15 border-purple-400/30',
    heroImage: '/brand/category-heroes/government.jpg',
  },
  {
    id: 'sponsor',
    label: 'Sponsor News',
    slug: 'sponsor',
    description:
      'What is happening with SVDG sponsors — announcements, funding, products, contracts, partnerships, and executive commentary.',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/15 border-amber-400/30',
    heroImage: '/brand/category-heroes/sponsor.jpg',
  },
  {
    id: 'international',
    label: 'International',
    slug: 'international',
    description:
      'Allied defense innovation, AUKUS, NATO, European and UK defense tech, Australian industrial base, and foreign defense investment.',
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-500/15 border-indigo-400/30',
    heroImage: '/brand/category-heroes/international.jpg',
  },
  {
    id: 'opinions',
    label: 'Opinions',
    slug: 'opinions',
    description:
      'Op-eds, essays, analysis, and commentary from think tanks, investors, defense leaders, and major publications that inform SVDG\'s perspective.',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/15 border-rose-400/30',
    heroImage: '/brand/category-heroes/opinions.jpg',
  },
]

export const REGIONS: Region[] = ['US', 'Europe', 'UK', 'Australia', 'Other']

export const WORKSTREAMS: Workstream[] = [
  'NatSec100',
  'Policy',
  'Industry Council',
  'Event Briefing',
  'Sponsor Engagement',
  'Newsletter',
  'International / Australia',
  'Capital Formation',
]

export const SUGGESTED_TAGS: string[] = [
  'AI',
  'Autonomy',
  'Space',
  'Cyber',
  'Maritime',
  'C2',
  'Munitions',
  'Industrial Base',
  'Acquisition Reform',
  'Venture Capital',
  'Private Equity',
  'AUKUS',
  'NATO',
  'NatSec100',
  'Industry Council',
  'Sponsor',
  'Export Controls',
  'Congress',
  'DoD',
  'DIU',
  'OSC',
  'DARPA',
  'CDAO',
  'Manufacturing',
  'Supply Chain',
  'Energy',
  'Nuclear',
  'Drones',
  'Robotics',
  'Software',
  'Defense Startup',
  'Dual-Use',
  'NDAA',
  'Budget',
  'Hypersonics',
  'Electronic Warfare',
  'Intelligence',
]

export function getCategoryConfig(label: Category): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.label === label)
}
