const DEFAULT_DISPATCH_BASE = 'https://svdg-news-feed.vercel.app'
const DEFAULT_CIRCUIT_BASE  = 'https://svdg-merry-go-round.vercel.app'

// Current SVDG sponsors — sourced from svdg-news-feed/src/data/sponsors.ts.
// Used to surface sponsor presence in the "Why it matters" field.
const SVDG_SPONSORS = [
  'Amazon Web Services', 'ACMI', 'Antares Industries', 'Applied Energetics',
  'ATI', 'Baird', 'Boeing Ventures', 'Booz Allen Hamilton',
  'Cape', 'CesiumAstro', 'ConductorAI', 'Crosslink Capital',
  'CSC Leasing', 'Fenwick and West LLP', 'Forterra', 'Franklin Templeton Investments',
  'Govini', 'Holland & Knight', 'Integrate', 'Jama Software',
  'JPMorgan Chase & Co.', 'Lila Sciences', 'Lockheed Martin Ventures', 'Machina Labs',
  'Mattermost', 'Microsoft', 'Modern Intelligence', 'Modern Venture Partners',
  'NightDragon', 'Nominal', 'Onebrief', 'Picogrid',
  'Pillsbury', 'Playground Global', 'Pryzm', 'PsiQuantum',
  'Real-Time Innovations', 'Red Cell Partners', 'REGENT', 'RTX Ventures',
  'Second Front Systems', 'Vannevar Labs', 'Virtualitics',
  'Washington Harbour Partners', 'webAI', 'X-Bow Systems',
  'Silicon Valley Defense Group', 'SVDG',
]

const DISPATCH_CATEGORIES = [
  'Industry News', 'Investor News', 'Government News',
  'Sponsor News', 'Opinions', 'International',
]

// ── Mode toggle ────────────────────────────────────────────
let activeMode = 'dispatch'

const panelDispatch = document.getElementById('panel-dispatch')
const panelCircuit  = document.getElementById('panel-circuit')
const btnDispatch   = document.getElementById('btn-dispatch')
const btnCircuit    = document.getElementById('btn-circuit')

async function setMode(mode) {
  activeMode = mode
  const isCircuit = mode === 'circuit'

  panelDispatch.hidden = isCircuit
  panelCircuit.hidden  = !isCircuit
  btnDispatch.classList.toggle('active', !isCircuit)
  btnCircuit.classList.toggle('active', isCircuit)

  await chrome.storage.local.set({ activeMode: mode })
}

btnDispatch.addEventListener('click', () => setMode('dispatch'))
btnCircuit.addEventListener('click',  () => setMode('circuit'))

// ── Shared: page info extraction ───────────────────────────
async function getPageInfo(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const meta = (name) =>
          document.querySelector(`meta[name="${name}"]`)?.content ||
          document.querySelector(`meta[property="${name}"]`)?.content || ''

        // Find Event JSON-LD block (used by Luma, Eventbrite, Hopin, etc.)
        let ld = null
        for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
          try {
            const parsed = JSON.parse(el.textContent)
            const items = [parsed].flat()
            for (const item of items) {
              const types = [item['@type']].flat()
              if (types.includes('Event')) { ld = item; break }
              const graphEvent = item['@graph']?.find(n => [n['@type']].flat().includes('Event'))
              if (graphEvent) { ld = graphEvent; break }
            }
            if (ld) break
          } catch {}
        }

        // Extract date + time from ISO string without timezone conversion
        function parseISO(str) {
          if (!str) return {}
          const m = str.match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/)
          return m ? { date: m[1], time: m[2] || '' } : {}
        }

        function extractLocation(loc) {
          if (!loc) return ''
          const l = Array.isArray(loc) ? loc[0] : loc
          if (typeof l === 'string') return TITLE_RE.test(l) ? '' : l
          if (l['@type'] === 'VirtualLocation') return 'Online'
          // l.name can be a speaker/organizer name on badly-structured pages — validate it
          if (l.name && !TITLE_RE.test(l.name)) return l.name
          const a = l.address
          if (!a) return ''
          if (typeof a === 'string') return a
          return [a.addressLocality, a.addressRegion, a.addressCountry].filter(Boolean).join(', ')
        }

        function extractFormat(mode) {
          const m = (typeof mode === 'string' ? mode : '').toLowerCase()
          if (m.includes('online') || m.includes('virtual')) return 'Virtual'
          if (m.includes('mixed')) return 'Hybrid'
          if (m.includes('offline') || m.includes('inperson')) return 'In-Person'
          return ''
        }

        function extractOrganizer(org) {
          if (!org) return ''
          const o = Array.isArray(org) ? org[0] : org
          return typeof o === 'string' ? o : (o.name || '')
        }

        // Job-title words that should never appear in a real location string.
        const TITLE_RE = /\b(VP|CEO|CTO|CFO|COO|CIO|SVP|EVP|President|Director|Manager|Officer|Partner|Principal|Founder|Head|Chair)\b/

        const start = parseISO(ld?.startDate)
        const end   = parseISO(ld?.endDate)

        // ── Text-based date + time + location fallback ────────────
        const MONTHS = { january:1,february:2,march:3,april:4,may:5,june:6,
          july:7,august:8,september:9,october:10,november:11,december:12,
          jan:1,feb:2,mar:3,apr:4,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 }

        function inferYear(month, day) {
          const now = new Date()
          const candidate = new Date(now.getFullYear(), month - 1, day)
          return candidate < new Date(now - 30*24*60*60*1000) ? now.getFullYear() + 1 : now.getFullYear()
        }

        function parseTime(str) {
          if (!str) return ''
          const m = str.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
          if (m) {
            let h = parseInt(m[1])
            const mins = m[2] || '00'
            if (m[3].toLowerCase() === 'pm' && h < 12) h += 12
            if (m[3].toLowerCase() === 'am' && h === 12) h = 0
            return `${String(h).padStart(2,'0')}:${mins}`
          }
          const m2 = str.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/)
          return m2 ? `${m2[1]}:${m2[2]}` : ''
        }

        function findAllDates(text) {
          // Returns array of { date, index } for every date found in text
          const MN = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec'
          const results = []
          const add = (date, index) => { if (date) results.push({ date, index }) }

          // "Month Day, Year"
          let re = new RegExp(`(${MN})\\w*\\.?\\s+(\\d{1,2})(?:-\\d{1,2})?,?\\s+(\\d{4})`, 'gi')
          for (const m of text.matchAll(re)) {
            const mo = String(MONTHS[m[1].toLowerCase().slice(0,3)]).padStart(2,'0')
            add(`${m[3]}-${mo}-${m[2].padStart(2,'0')}`, m.index)
          }
          // "Month Day" (no year — infer)
          re = new RegExp(`(${MN})\\w*\\.?\\s+(\\d{1,2})\\b(?![\\s,]*\\d{4})`, 'gi')
          for (const m of text.matchAll(re)) {
            const mo = parseInt(MONTHS[m[1].toLowerCase().slice(0,3)])
            const dy = parseInt(m[2])
            add(`${inferYear(mo,dy)}-${String(mo).padStart(2,'0')}-${String(dy).padStart(2,'0')}`, m.index)
          }
          // ISO "2026-11-04"
          re = /\b(\d{4})-(\d{2})-(\d{2})\b/g
          for (const m of text.matchAll(re)) add(`${m[1]}-${m[2]}-${m[3]}`, m.index)
          // "11/04/2026"
          re = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g
          for (const m of text.matchAll(re)) add(`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`, m.index)

          return results.sort((a, b) => a.index - b.index)
        }

        function extractLocationFromText(text, anchorIdx) {
          // Look in a window around + after the anchor
          const window = text.slice(Math.max(0, anchorIdx - 200), anchorIdx + 1500)
          // Only match real US state/territory abbreviations to avoid false positives
          // like "Elizabeth Graham, VP" where VP looks like a two-letter state code.
          const STATES = new Set([
            'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
            'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
            'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
            'TX','UT','VT','VA','WA','WV','WI','WY','DC','PR','GU','VI',
          ])
          const re = /\b([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*),\s*([A-Z]{2})\b/g
          let m
          while ((m = re.exec(window)) !== null) {
            if (STATES.has(m[2])) return `${m[1]}, ${m[2]}`
          }
          return ''
        }

        function textFallback() {
          const fullText = document.body.innerText || document.body.textContent || ''

          const dates = findAllDates(fullText)
          const timeRe = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi

          // Pick the anchor whose first subsequent time is earliest in the day —
          // this finds the main event start rather than a pre-event/reception.
          let bestAnchor = null
          for (const d of dates) {
            const slice = fullText.slice(d.index, d.index + 4000)
            timeRe.lastIndex = 0
            const tm = timeRe.exec(slice)
            const firstTime = tm ? parseTime(tm[1]) : ''
            const firstHour = firstTime ? parseInt(firstTime) : 25
            if (!bestAnchor || firstHour < bestAnchor.firstHour) {
              bestAnchor = { ...d, firstTime, firstHour }
            }
          }

          let date = bestAnchor?.date || ''
          let startTime = bestAnchor?.firstTime || ''
          let endTime = ''

          if (bestAnchor) {
            const afterDate = fullText.slice(bestAnchor.index)
            const allTimes = [...afterDate.matchAll(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi)]
            const endMarkers = [...afterDate.matchAll(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b[^\n]{0,40}(?:concludes?|ends?\b|closing|close\b|end of event|doors close)/gi)]
            endTime = endMarkers.length > 0
              ? parseTime(endMarkers[endMarkers.length - 1][1])
              : allTimes.length > 1 ? parseTime(allTimes[allTimes.length - 1][1]) : ''
          }

          // <time datetime> elements are more reliable for date/time — override
          // text-parsed values if found, but keep going to extract location.
          for (const el of document.querySelectorAll('time[datetime]')) {
            const r = parseISO(el.getAttribute('datetime'))
            if (r.date) { date = r.date; if (r.time) startTime = r.time; break }
          }

          if (!date) return {}

          // Location lives near the FIRST date mention (hero/header), not the
          // earliest-time anchor (which may be deep in an agenda section).
          // Search from the first date outward, then fall back to full text.
          const firstDateIdx = dates.length ? dates[0].index : 0
          const location = extractLocationFromText(fullText, firstDateIdx)
          return { date, startTime, endTime, location }
        }

        // Always run textFallback — even when JSON-LD has dates, we still need
        // the text-based location extraction as a validated fallback.
        const fallback = textFallback()
        const startResult = {
          date: start.date || fallback.date || '',
          time: start.time || fallback.startTime || '',
        }
        const endResult = {
          date: end.date || startResult.date || '',
          time: end.time || fallback.endTime || '',
        }

        // ── SVDG sponsor scan ─────────────────────────────────
        const pageText = document.body.innerText || document.body.textContent || ''

        // Collect image alt text + cleaned filenames for logo-based sponsor detection
        const imageText = [...document.querySelectorAll('img')]
          .flatMap(img => [
            img.alt || '',
            (img.src || '').split('/').pop().replace(/\?.*$/, '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          ])
          .filter(Boolean)
          .join(' | ')

        return {
          title:       ld?.name || meta('og:title') || '',
          description: (window.getSelection?.().toString().trim() ||
                        ld?.description || meta('description') || meta('og:description') || '').slice(0, 500),
          organizer:   extractOrganizer(ld?.organizer),
          location:    extractLocation(ld?.location) || meta('og:locality') || meta('og:region') || fallback?.location || '',
          format:      extractFormat(ld?.eventAttendanceMode),
          startDate:   startResult.date  || '',
          startTime:   startResult.time  || '',
          endDate:     endResult.date    || '',
          endTime:     endResult.time    || '',
          // Pass raw page text + image metadata back — sponsor matching done in popup
          // context where SVDG_SPONSORS is defined.
          pageText:    pageText.slice(0, 8000),
          imageText:   imageText.slice(0, 4000),
        }
      },
    })
    return result || {}
  } catch {
    return {}
  }
}

// ── Dispatch form ──────────────────────────────────────────
const d = {
  form:        document.getElementById('dispatch-form'),
  title:       document.getElementById('d-title'),
  url:         document.getElementById('d-url'),
  source:      document.getElementById('d-source'),
  description: document.getElementById('d-description'),
  categories:  document.getElementById('d-categories'),
  tags:        document.getElementById('d-tags'),
  submit:      document.getElementById('d-submit'),
  status:      document.getElementById('d-status'),
}

function renderCategories() {
  DISPATCH_CATEGORIES.forEach((label, i) => {
    const id = `cat-${i}`
    const wrap = document.createElement('label')
    wrap.innerHTML = `<input type="checkbox" id="${id}" value="${label}" /> ${label}`
    d.categories.appendChild(wrap)
  })
}

function getCheckedCategories() {
  return [...d.categories.querySelectorAll('input[type="checkbox"]:checked')].map(el => el.value)
}

d.form.addEventListener('submit', async (e) => {
  e.preventDefault()
  d.submit.disabled = true
  d.status.textContent = 'Saving…'
  d.status.className = 'status'

  const { dispatchApiBase, dispatchApiKey } = await chrome.storage.sync.get(['dispatchApiBase', 'dispatchApiKey'])
  const base = (dispatchApiBase || DEFAULT_DISPATCH_BASE).replace(/\/$/, '')

  try {
    const res = await fetch(`${base}/api/extension/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(dispatchApiKey ? { 'x-api-key': dispatchApiKey } : {}),
      },
      body: JSON.stringify({
        title:       d.title.value.trim(),
        url:         d.url.value.trim(),
        source:      d.source.value.trim(),
        description: d.description.value.trim(),
        categories:  getCheckedCategories(),
        tags:        d.tags.value.trim(),
      }),
    })
    if (res.status === 401) {
      d.status.textContent = 'Unauthorized — check your API key in Settings.'
      d.status.className = 'status error'
    } else if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      d.status.textContent = data.error || `Failed (${res.status})`
      d.status.className = 'status error'
    } else {
      d.status.textContent = 'Added to Dispatch ✓'
      d.status.className = 'status success'
      setTimeout(() => window.close(), 900)
    }
  } catch {
    d.status.textContent = 'Network error — check Settings for the site URL.'
    d.status.className = 'status error'
  } finally {
    d.submit.disabled = false
  }
})

// ── Circuit form ───────────────────────────────────────────
const c = {
  form:      document.getElementById('circuit-form'),
  title:     document.getElementById('c-title'),
  url:       document.getElementById('c-url'),
  organizer: document.getElementById('c-organizer'),
  startDate: document.getElementById('c-startDate'),
  endDate:   document.getElementById('c-endDate'),
  startTime: document.getElementById('c-startTime'),
  endTime:   document.getElementById('c-endTime'),
  eventType: document.getElementById('c-eventType'),
  format:    document.getElementById('c-format'),
  location:  document.getElementById('c-location'),
  notes:     document.getElementById('c-notes'),
  submit:    document.getElementById('c-submit'),
  status:    document.getElementById('c-status'),
}

c.form.addEventListener('submit', async (e) => {
  e.preventDefault()
  c.submit.disabled = true
  c.status.textContent = 'Saving…'
  c.status.className = 'status'

  const { circuitApiBase, circuitApiKey } = await chrome.storage.sync.get(['circuitApiBase', 'circuitApiKey'])
  const base = (circuitApiBase || DEFAULT_CIRCUIT_BASE).replace(/\/$/, '')

  try {
    const res = await fetch(`${base}/api/extension/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(circuitApiKey ? { 'x-api-key': circuitApiKey } : {}),
      },
      body: JSON.stringify({
        title:     c.title.value.trim(),
        url:       c.url.value.trim(),
        source:    c.organizer.value.trim(),
        startDate: c.startDate.value,
        endDate:   c.endDate.value || undefined,
        startTime: c.startTime.value || undefined,
        endTime:   c.endTime.value || undefined,
        eventType: c.eventType.value,
        format:    c.format.value,
        location:  c.location.value.trim() || undefined,
        notes:     c.notes.value.trim() || undefined,
      }),
    })
    if (res.status === 401) {
      c.status.textContent = 'Unauthorized — check your API key in Settings.'
      c.status.className = 'status error'
    } else if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      c.status.textContent = data.error || `Failed (${res.status})`
      c.status.className = 'status error'
    } else {
      c.status.textContent = 'Added to Circuit ✓'
      c.status.className = 'status success'
      setTimeout(() => window.close(), 900)
    }
  } catch {
    c.status.textContent = 'Network error — check Settings for the site URL.'
    c.status.className = 'status error'
  } finally {
    c.submit.disabled = false
  }
})

// ── Settings link ──────────────────────────────────────────
document.querySelectorAll('.open-options').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault()
    chrome.runtime.openOptionsPage()
  })
})

// ── Why it matters generator ───────────────────────────────
function buildWhyItMatters(pageInfo, title) {
  const text = pageInfo.pageText || ''
  const imgText = pageInfo.imageText || ''

  // Match sponsors against page text AND image alt/filenames (catches logo-only sponsor grids)
  const found = SVDG_SPONSORS.filter(s => {
    const pattern = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (pattern.test(text)) return true
    // Looser match for image filenames (no word boundaries, spaces collapsed)
    const normalized = s.toLowerCase().replace(/\s+/g, '')
    return imgText.toLowerCase().replace(/\s+/g, '').includes(normalized)
  })

  // Detect mission-relevant keywords
  const MISSION_KEYWORDS = [
    'defense', 'national security', 'dual-use', 'dual use', 'intelligence',
    'dod', 'department of defense', 'pentagon', 'darpa', 'diu',
    'venture', 'venture capital', 'startup', 'founder', 'emerging tech',
    'space', 'cyber', 'autonomy', 'ai', 'artificial intelligence',
    'drone', 'unmanned', 'hypersonic', 'electronic warfare',
  ]
  const matchedKeywords = MISSION_KEYWORDS.filter(k =>
    text.toLowerCase().includes(k)
  )

  const parts = []

  // Mission angle
  const isDefense = matchedKeywords.some(k =>
    ['defense','national security','dual-use','dual use','dod','pentagon','darpa','diu'].includes(k)
  )
  const isVC = matchedKeywords.some(k =>
    ['venture','venture capital','startup','founder'].includes(k)
  )
  if (isDefense && isVC) {
    parts.push('Sits at the intersection of defense tech and venture capital — directly in SVDG\'s lane.')
  } else if (isDefense) {
    parts.push('Defense and national security focus aligns with SVDG\'s mission.')
  } else if (isVC) {
    parts.push('Venture and founder community relevant to SVDG\'s capital formation work.')
  }

  // Sponsor callout
  if (found.length > 0) {
    const names = found.filter(s => s !== 'Silicon Valley Defense Group' && s !== 'SVDG')
    const svdgSelf = found.some(s => s === 'Silicon Valley Defense Group' || s === 'SVDG')
    if (svdgSelf) parts.push('SVDG is directly mentioned or represented.')
    if (names.length > 0) {
      parts.push(`SVDG sponsors on the page: ${names.slice(0, 5).join(', ')}.`)
    }
  }

  return parts.join(' ')
}

// ── Init ───────────────────────────────────────────────────
async function init() {
  renderCategories()

  // Restore last active mode
  const { activeMode: savedMode } = await chrome.storage.local.get('activeMode')
  if (savedMode === 'circuit') setMode('circuit')

  // Pre-fill from active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab) return

  const pageInfo = await getPageInfo(tab.id)
  let hostname = ''
  try { hostname = new URL(tab.url).hostname.replace(/^www\./, '') } catch {}

  // Dispatch fields
  d.title.value       = tab.title || ''
  d.url.value         = tab.url || ''
  d.source.value      = hostname
  d.description.value = pageInfo.description || ''

  // Circuit fields
  c.title.value     = pageInfo.title || tab.title || ''
  c.url.value       = tab.url || ''
  c.organizer.value = pageInfo.organizer || hostname
  c.location.value  = pageInfo.location || ''
  if (pageInfo.startDate) c.startDate.value = pageInfo.startDate
  if (pageInfo.startTime) c.startTime.value = pageInfo.startTime
  if (pageInfo.endDate)   c.endDate.value   = pageInfo.endDate
  if (pageInfo.endTime)   c.endTime.value   = pageInfo.endTime
  if (pageInfo.format) {
    const opt = [...(c.format?.options || [])].find(o => o.value === pageInfo.format)
    if (opt) c.format.value = pageInfo.format
  }
  const whyItMatters = buildWhyItMatters(pageInfo, c.title.value)
  if (whyItMatters) c.notes.value = whyItMatters
}

init()
