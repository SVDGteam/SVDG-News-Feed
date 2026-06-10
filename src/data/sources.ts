/**
 * Approved source universe for the recurring AI-enabled research job.
 *
 * This is NOT a checklist to exhaustively crawl every day. It's the pool of
 * outlets, newsletters, trackers, and institutional sites the research job
 * is allowed to pull from. The job should use judgment to spot-check a
 * subset each run (favoring priority 1, then 2, then occasionally 3) and
 * surface only a small number of genuinely high-quality, high-relevance
 * pieces — quality bar over coverage.
 *
 * Source: "SVDG News Intelligence Platform — Starting Source List" (2026-06-10)
 */

export type SourceType = 'Newsletter' | 'Search' | 'Tracker'

/** 1 = check first / most runs, 2 = check often, 3 = occasional / lower signal */
export type SourcePriority = 1 | 2 | 3

export interface NewsSource {
  id: string
  name: string
  /** How the research job should approach this source. A source can be more than one type. */
  types: SourceType[]
  priority: SourcePriority
  /** Free-form region descriptor, e.g. "US / International" */
  region: string
  /** What this source is good for / why it's on the list */
  useCase: string
}

export const SOURCES: NewsSource[] = [
  // ── Priority 1 — newsletters & trackers ──────────────────────────────────
  {
    id: 'tectonic',
    name: 'Tectonic',
    types: ['Newsletter'],
    priority: 1,
    region: 'US / International',
    useCase:
      'High-signal defense startup, venture-backed defense tech, private-sector defense innovation, and defense capital markets coverage.',
  },
  {
    id: 'pryzm',
    name: 'Pryzm',
    types: ['Newsletter', 'Tracker'],
    priority: 1,
    region: 'US',
    useCase:
      'Company-level tracker for NatSec100, sponsor, target universe, and defense/dual-use company updates.',
  },
  {
    id: 'payload',
    name: 'Payload',
    types: ['Newsletter'],
    priority: 1,
    region: 'US / International',
    useCase:
      'Space industry, commercial space, space startups, launch, satellites, Space Force, and space investment coverage.',
  },
  {
    id: 'punchbowl',
    name: 'Punchbowl',
    types: ['Newsletter'],
    priority: 1,
    region: 'US',
    useCase:
      'Congressional dynamics, appropriations, NDAA timing, Hill context, and defense-relevant political developments.',
  },

  // ── Priority 1 — US defense policy & industry press ──────────────────────
  {
    id: 'politico-morning-defense',
    name: 'Politico Morning Defense / National Security',
    types: ['Search'],
    priority: 1,
    region: 'US',
    useCase:
      'Federal defense policy, Pentagon news, acquisition reform, budget cycle, and congressional defense priorities.',
  },
  {
    id: 'breaking-defense',
    name: 'Breaking Defense',
    types: ['Search'],
    priority: 1,
    region: 'US / International',
    useCase:
      'Defense acquisition, military technology, service priorities, Pentagon policy, and defense industry developments.',
  },
  {
    id: 'defense-news',
    name: 'Defense News',
    types: ['Search'],
    priority: 1,
    region: 'US / International',
    useCase:
      'Broad defense market, acquisition, budget, global defense industry, and military modernization coverage.',
  },
  {
    id: 'defense-one',
    name: 'Defense One',
    types: ['Search'],
    priority: 1,
    region: 'US',
    useCase:
      'Defense policy, emerging technology adoption, Pentagon reform, AI, cyber, and national security analysis.',
  },
  {
    id: 'war-on-the-rocks',
    name: 'War on the Rocks',
    types: ['Search'],
    priority: 1,
    region: 'US / International',
    useCase: "Strategic analysis and opinion pieces that can inform SVDG's policy perspective.",
  },

  // ── Priority 1 — official / government sources ───────────────────────────
  {
    id: 'dod',
    name: 'Department of Defense',
    types: ['Search'],
    priority: 1,
    region: 'US',
    useCase:
      'Official Pentagon announcements, strategy documents, acquisition updates, and major policy releases.',
  },
  {
    id: 'diu',
    name: 'Defense Innovation Unit',
    types: ['Search'],
    priority: 1,
    region: 'US',
    useCase:
      'Commercial technology adoption, defense innovation pathways, and nontraditional vendor engagement.',
  },
  {
    id: 'osc',
    name: 'Office of Strategic Capital',
    types: ['Search'],
    priority: 1,
    region: 'US',
    useCase:
      'Defense capital formation, investment policy, loan programs, and industrial base financing.',
  },

  // ── Priority 1 — think tanks ──────────────────────────────────────────────
  {
    id: 'csis',
    name: 'CSIS',
    types: ['Search'],
    priority: 1,
    region: 'US / International',
    useCase:
      'Defense policy, acquisition, industrial base, technology, China, and strategic competition analysis.',
  },
  {
    id: 'cnas',
    name: 'CNAS',
    types: ['Search'],
    priority: 1,
    region: 'US / International',
    useCase: 'Defense innovation, emerging technology, national security strategy, and policy analysis.',
  },
  {
    id: 'scsp',
    name: 'SCSP',
    types: ['Search'],
    priority: 1,
    region: 'US',
    useCase:
      'AI, emerging technology, national competitiveness, industrial base, and national security technology policy.',
  },

  // ── Priority 1 — Europe / NATO ────────────────────────────────────────────
  {
    id: 'nato',
    name: 'NATO',
    types: ['Search'],
    priority: 1,
    region: 'Europe / International',
    useCase:
      'Alliance defense innovation, procurement, deterrence, Ukraine support, and industrial base coordination.',
  },
  {
    id: 'european-defence-agency',
    name: 'European Defence Agency',
    types: ['Search'],
    priority: 1,
    region: 'Europe',
    useCase: 'European defense cooperation, joint procurement, capability development, and defense innovation.',
  },
  {
    id: 'ec-defence-industry-edf',
    name: 'European Commission — Defence Industry / EDF',
    types: ['Search'],
    priority: 1,
    region: 'Europe',
    useCase: 'EU defense industrial strategy, defense funding, startup support, and procurement policy.',
  },
  {
    id: 'politico-europe',
    name: 'Politico Europe',
    types: ['Search'],
    priority: 1,
    region: 'Europe',
    useCase: 'European defense policy, EU politics, NATO, Ukraine, and defense industrial strategy.',
  },

  // ── Priority 1 — UK ────────────────────────────────────────────────────────
  {
    id: 'uk-mod',
    name: 'UK Ministry of Defence',
    types: ['Search'],
    priority: 1,
    region: 'UK',
    useCase: 'UK defense policy, procurement, innovation, modernization, and allied defense technology.',
  },
  {
    id: 'dasa',
    name: 'Defence and Security Accelerator',
    types: ['Search'],
    priority: 1,
    region: 'UK',
    useCase: 'UK defense innovation, startup engagement, challenge-based procurement, and dual-use technology adoption.',
  },
  {
    id: 'rusi',
    name: 'RUSI',
    types: ['Search'],
    priority: 1,
    region: 'UK / Europe',
    useCase: 'UK and European defense policy, military innovation, acquisition, industrial base, and strategic analysis.',
  },

  // ── Priority 1 — Australia ─────────────────────────────────────────────────
  {
    id: 'au-dod',
    name: 'Australian Department of Defence',
    types: ['Search'],
    priority: 1,
    region: 'Australia',
    useCase: 'Australian defense policy, procurement, AUKUS, sovereign industrial capability, and defense innovation.',
  },
  {
    id: 'asca',
    name: 'Advanced Strategic Capabilities Accelerator',
    types: ['Search'],
    priority: 1,
    region: 'Australia',
    useCase:
      'Australian defense innovation, nontraditional vendors, dual-use technology, and AUKUS-relevant capability development.',
  },
  {
    id: 'defence-connect',
    name: 'Defence Connect',
    types: ['Search'],
    priority: 1,
    region: 'Australia',
    useCase: 'Australian defense industry, government procurement, company announcements, and defense business news.',
  },
  {
    id: 'australian-defence-magazine',
    name: 'Australian Defence Magazine',
    types: ['Search'],
    priority: 1,
    region: 'Australia',
    useCase: 'Australian defense industry, procurement, contracts, company news, and sovereign capability.',
  },
  {
    id: 'aspi-the-strategist',
    name: 'ASPI / The Strategist',
    types: ['Search'],
    priority: 1,
    region: 'Australia',
    useCase: 'Australian defense policy, Indo-Pacific security, AUKUS, China, and strategic analysis.',
  },

  // ── Priority 1 — SVDG / portfolio specific ────────────────────────────────
  {
    id: 'svdg-sponsor-company-pages',
    name: 'SVDG Sponsor Company Pages',
    types: ['Search'],
    priority: 1,
    region: 'US / International',
    useCase: 'Sponsor announcements, contracts, funding, product launches, partnerships, and executive commentary.',
  },
  {
    id: 'natsec100-company-pages',
    name: 'NatSec100 Company Pages',
    types: ['Search'],
    priority: 1,
    region: 'US / International',
    useCase: 'Company updates relevant to NatSec100 scoring, ecosystem monitoring, funding, contracts, and market activity.',
  },

  // ── Priority 2 — major business / financial press ─────────────────────────
  {
    id: 'wsj',
    name: 'Wall Street Journal',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Major business, defense industry, capital markets, geopolitics, IPOs, M&A, and public-market context.',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Market-moving financial, defense industry, technology, investment, and geopolitical news.',
  },
  {
    id: 'financial-times',
    name: 'Financial Times',
    types: ['Search'],
    priority: 2,
    region: 'International / Europe / UK',
    useCase: 'International defense investment, capital markets, European defense industry, and geopolitical economy.',
  },
  {
    id: 'reuters',
    name: 'Reuters',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Reliable wire coverage of defense industry, public companies, government announcements, and global security.',
  },
  {
    id: 'axios',
    name: 'Axios',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Fast-moving national security, technology, AI, politics, and venture capital context.',
  },
  {
    id: 'the-information',
    name: 'The Information',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Tech industry, AI companies, startup financing, venture capital, and major technology platforms.',
  },

  // ── Priority 2 — domain trade press ───────────────────────────────────────
  {
    id: 'spacenews',
    name: 'SpaceNews',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Space industry, commercial space, government space programs, satellite firms, and space investment.',
  },
  {
    id: 'c4isrnet',
    name: 'C4ISRNET',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Defense software, communications, sensors, cyber, electronic warfare, AI, and command-and-control.',
  },
  {
    id: 'national-defense-magazine',
    name: 'National Defense Magazine',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Defense industrial base, acquisition, manufacturing, and industry association perspective.',
  },
  {
    id: 'air-space-forces-magazine',
    name: 'Air & Space Forces Magazine',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Air Force and Space Force modernization, acquisition, programs, and aerospace industry.',
  },
  {
    id: 'usni-news',
    name: 'USNI News',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Navy, Marine Corps, maritime defense, shipbuilding, acquisition, and Indo-Pacific posture.',
  },

  // ── Priority 2 — US government / R&D ──────────────────────────────────────
  {
    id: 'darpa',
    name: 'DARPA',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Advanced technology programs, R&D priorities, solicitations, and emerging defense technology signals.',
  },
  {
    id: 'cdao',
    name: 'Chief Digital and Artificial Intelligence Office',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'DoD AI, data, software modernization, and digital transformation.',
  },

  // ── Priority 2 — Congress / oversight ─────────────────────────────────────
  {
    id: 'congress-gov',
    name: 'Congress.gov',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Defense-related bills, amendments, authorization, appropriations, and legislative tracking.',
  },
  {
    id: 'hasc',
    name: 'House Armed Services Committee',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Hearings, markups, statements, NDAA process, and defense legislative priorities.',
  },
  {
    id: 'sasc',
    name: 'Senate Armed Services Committee',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Hearings, markups, statements, NDAA process, and defense legislative priorities.',
  },
  {
    id: 'gao',
    name: 'GAO',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Oversight reports on acquisition, major defense programs, industrial base, and technology adoption.',
  },
  {
    id: 'crs-reports',
    name: 'CRS Reports',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Congressional research useful for memos, backgrounders, and policy analysis.',
  },

  // ── Priority 2 — think tanks (broader) ────────────────────────────────────
  {
    id: 'rand',
    name: 'RAND',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Long-form research on defense policy, acquisition, military modernization, and allied defense.',
  },
  {
    id: 'hudson-institute',
    name: 'Hudson Institute',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Defense policy commentary, strategic competition, industrial base, and technology policy.',
  },
  {
    id: 'atlantic-council',
    name: 'Atlantic Council',
    types: ['Search'],
    priority: 2,
    region: 'US / Europe / International',
    useCase: 'NATO, Ukraine, Europe, allied defense, and transatlantic security.',
  },
  {
    id: 'isw',
    name: 'ISW',
    types: ['Search'],
    priority: 2,
    region: 'Europe / International',
    useCase: 'Battlefield context, Ukraine war analysis, operational lessons, drones, and attritable systems.',
  },
  {
    id: 'iiss',
    name: 'IISS',
    types: ['Search'],
    priority: 2,
    region: 'International',
    useCase: 'Global defense trends, defense spending, military modernization, and strategic analysis.',
  },

  // ── Priority 2 — Europe (broader) ─────────────────────────────────────────
  {
    id: 'euractiv-defense',
    name: 'Euractiv Defense',
    types: ['Search'],
    priority: 2,
    region: 'Europe',
    useCase: 'EU defense policy, procurement, industrial strategy, NATO, and European security.',
  },
  {
    id: 'the-parliament-magazine',
    name: 'The Parliament Magazine',
    types: ['Search'],
    priority: 2,
    region: 'Europe',
    useCase: 'European policy commentary, EU defense innovation, procurement barriers, and industrial policy.',
  },
  {
    id: 'bruegel',
    name: 'Bruegel',
    types: ['Search'],
    priority: 2,
    region: 'Europe',
    useCase: 'European defense procurement, industrial policy, innovation, economic security, and capital formation.',
  },

  // ── Priority 2 — UK (broader) ─────────────────────────────────────────────
  {
    id: 'uk-defence-journal',
    name: 'UK Defence Journal',
    types: ['Search'],
    priority: 2,
    region: 'UK',
    useCase: 'UK defense updates, service modernization, procurement, and defense industry news.',
  },

  // ── Priority 2 — Australia (broader) ──────────────────────────────────────
  {
    id: 'dstg',
    name: 'Defence Science and Technology Group',
    types: ['Search'],
    priority: 2,
    region: 'Australia',
    useCase: 'Australian defense R&D, science and technology priorities, and allied technology cooperation.',
  },
  {
    id: 'lowy-institute',
    name: 'Lowy Institute',
    types: ['Search'],
    priority: 2,
    region: 'Australia / Indo-Pacific',
    useCase: 'Australian foreign policy, Indo-Pacific security, China, and regional strategic context.',
  },
  {
    id: 'us-studies-centre',
    name: 'United States Studies Centre',
    types: ['Search'],
    priority: 2,
    region: 'Australia / US',
    useCase: 'U.S.-Australia defense industrial cooperation, AUKUS, allied technology, and policy analysis.',
  },
  {
    id: 'innovationaus',
    name: 'InnovationAus',
    types: ['Search'],
    priority: 2,
    region: 'Australia',
    useCase: 'Australian technology, innovation policy, startup ecosystem, and industrial policy.',
  },

  // ── Priority 2 — venture / capital markets data ───────────────────────────
  {
    id: 'pitchbook',
    name: 'PitchBook',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Financing data, valuations, fundraises, M&A, IPOs, and investor activity.',
  },
  {
    id: 'crunchbase',
    name: 'Crunchbase',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Startup financing, investor participation, company profiles, funding rounds, and ecosystem mapping.',
  },
  {
    id: 'axios-pro-rata',
    name: 'Axios Pro Rata',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Venture capital, private equity, M&A, IPOs, and broader private-market context.',
  },
  {
    id: 'term-sheet',
    name: 'Term Sheet',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Venture capital, private equity, startup funding, and capital markets context.',
  },

  // ── Priority 2 — primes & procurement / regulatory ────────────────────────
  {
    id: 'major-defense-prime-press-rooms',
    name: 'Major Defense Prime Press Rooms',
    types: ['Search'],
    priority: 2,
    region: 'US / International',
    useCase: 'Prime contractor partnerships, major awards, acquisitions, and industrial base developments.',
  },
  {
    id: 'sam-gov',
    name: 'SAM.gov',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Contract opportunities, procurement signals, solicitations, and federal acquisition activity.',
  },
  {
    id: 'federal-register',
    name: 'Federal Register',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Regulatory changes, procurement rules, export controls, industrial policy, and federal policy updates.',
  },
  {
    id: 'commerce-bis',
    name: 'Department of Commerce / BIS',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Export controls, technology restrictions, China policy, industrial policy, and economic security.',
  },
  {
    id: 'doe-nnsa',
    name: 'Department of Energy / NNSA',
    types: ['Search'],
    priority: 2,
    region: 'US',
    useCase: 'Nuclear modernization, energy security, critical technology, and industrial base developments.',
  },

  // ── Priority 3 ─────────────────────────────────────────────────────────────
  {
    id: 'strictlyvc',
    name: 'StrictlyVC',
    types: ['Search'],
    priority: 3,
    region: 'US',
    useCase: 'Broader startup, VC, investor, and funding ecosystem updates.',
  },
]

export function getSourcesByPriority(priority: SourcePriority): NewsSource[] {
  return SOURCES.filter((s) => s.priority === priority)
}

export function getSourceById(id: string): NewsSource | undefined {
  return SOURCES.find((s) => s.id === id)
}
