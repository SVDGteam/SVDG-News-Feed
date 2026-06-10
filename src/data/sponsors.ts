export interface Sponsor {
  name: string
  website: string
}

// SVDG sponsor roster — used to populate the Sponsor Name field on the
// article form and the sponsor filter on Sponsor News / Archive.
export const SPONSORS: Sponsor[] = [
  { name: 'Amazon Web Services', website: 'aws.amazon.com' },
  { name: 'American Center for Manufacturing & Innovation (ACMI)', website: 'acmigroup.com' },
  { name: 'Antares Industries', website: 'antaresindustries.com' },
  { name: 'Applied Energetics', website: 'appliedenergetics.com' },
  { name: 'ATI', website: 'ati.org' },
  { name: 'Baird', website: 'rwbaird.com' },
  { name: 'Boeing Ventures', website: 'boeing.com' },
  { name: 'Booz Allen Hamilton', website: 'boozallen.com' },
  { name: 'Cape', website: 'cape.co' },
  { name: 'CesiumAstro', website: 'cesiumastro.com' },
  { name: 'ConductorAI', website: 'conductorai.co' },
  { name: 'Crosslink Capital', website: 'crosslinkcapital.com' },
  { name: 'CSC Leasing', website: 'cscleasing.com' },
  { name: 'Fenwick and West LLP', website: 'fenwick.com' },
  { name: 'Forterra', website: 'forterra.com' },
  { name: 'Franklin Templeton Investments', website: 'franklintempleton.com' },
  { name: 'Govini', website: 'govini.com' },
  { name: 'Holland & Knight', website: 'hklaw.com' },
  { name: 'Integrate', website: 'integrate.co' },
  { name: 'Jama Software', website: 'jamasoftware.com' },
  { name: 'JPMorgan Chase & Co.', website: 'jpmchase.com' },
  { name: 'Lila Sciences', website: 'lila.ai' },
  { name: 'Lockheed Martin Ventures', website: 'lockheedmartin.com' },
  { name: 'Machina Labs', website: 'machinalabs.ai' },
  { name: 'Mattermost', website: 'mattermost.com' },
  { name: 'Microsoft', website: 'microsoft.com' },
  { name: 'Modern Intelligence', website: 'modernintelligence.ai' },
  { name: 'Modern Venture Partners', website: 'mvp-vc.com' },
  { name: 'NightDragon', website: 'nightdragon.com' },
  { name: 'Nominal', website: 'nominal.io' },
  { name: 'Onebrief', website: 'onebrief.com' },
  { name: 'Picogrid', website: 'picogrid.com' },
  { name: 'Pillsbury', website: 'pillsburylaw.com' },
  { name: 'Playground Global', website: 'playground.vc' },
  { name: 'Pryzm', website: 'pryzm.io' },
  { name: 'PsiQuantum', website: 'psiquantum.com' },
  { name: 'Real-Time Innovations', website: 'rti.com' },
  { name: 'Red Cell Partners', website: 'redcellpartners.com' },
  { name: 'REGENT', website: 'regentcraft.com' },
  { name: 'RTX Ventures', website: 'rtx.com' },
  { name: 'SAIC', website: 'saic.com' },
  { name: 'Second Front Systems', website: 'secondfront.com' },
  { name: 'Vannevar Labs', website: 'vannevarlabs.com' },
  { name: 'Virtualitics', website: 'virtualitics.com' },
  { name: 'Washington Harbour Partners', website: 'washingtonharbour.com' },
  { name: 'webAI', website: 'webai.com' },
  { name: 'X-Bow Systems', website: 'xbowsystems.com' },
]

export const SPONSOR_NAMES: string[] = SPONSORS.map((s) => s.name).sort((a, b) =>
  a.localeCompare(b)
)
