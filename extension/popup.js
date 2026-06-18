const DEFAULT_DISPATCH_BASE = 'https://svdg-news-feed.vercel.app'
const DEFAULT_CIRCUIT_BASE  = 'https://svdg-merry-go-round.vercel.app'

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
          if (typeof l === 'string') return l
          if (l['@type'] === 'VirtualLocation') return 'Online'
          if (l.name) return l.name
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

        const start = parseISO(ld?.startDate)
        const end   = parseISO(ld?.endDate)

        // ── Text-based date + time fallback ──────────────────────
        const MONTHS = { january:1,february:2,march:3,april:4,may:5,june:6,
          july:7,august:8,september:9,october:10,november:11,december:12,
          jan:1,feb:2,mar:3,apr:4,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 }

        function parseDateAt(str, idx) {
          // Returns { date, index } of first date found at or after idx in str
          const patterns = [
            // "November 4, 2026" / "Nov 4-5, 2026"
            /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+(\d{1,2})(?:-\d{1,2})?,?\s+(\d{4})/gi,
            // "4 November 2026"
            /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\w*\.?\s+(\d{4})/gi,
            // "2026-11-04"
            /(\d{4})-(\d{2})-(\d{2})/g,
            // "11/04/2026"
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
          ]
          let best = null
          const sub = str.slice(idx)
          for (const re of patterns) {
            re.lastIndex = 0
            const m = re.exec(sub)
            if (!m) continue
            let date
            const t = m[0].toLowerCase()
            if (/^\d{4}-/.test(m[0])) {
              date = `${m[1]}-${m[2]}-${m[3]}`
            } else if (/^\d{1,2}\//.test(m[0])) {
              date = `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`
            } else if (/^\d{1,2}\s/.test(m[0])) {
              const mo = String(MONTHS[m[2].toLowerCase().slice(0,3)]).padStart(2,'0')
              date = `${m[3]}-${mo}-${m[1].padStart(2,'0')}`
            } else {
              const mo = String(MONTHS[m[1].toLowerCase().slice(0,3)]).padStart(2,'0')
              date = `${m[3]}-${mo}-${m[2].padStart(2,'0')}`
            }
            const absIdx = idx + m.index
            if (!best || absIdx < best.index) best = { date, index: absIdx }
          }
          return best
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

        function textFallback() {
          // 1. <time datetime> elements
          for (const el of document.querySelectorAll('time[datetime]')) {
            const r = parseISO(el.getAttribute('datetime'))
            if (r.date) return r
          }

          // 2. Work on the full visible page text — gives us positional context
          const fullText = document.body.innerText || document.body.textContent || ''

          // Find the first date, then look for a LATER date that is not a recap/past date
          // Strategy: prefer dates that appear earlier and have times nearby
          const firstDate = parseDateAt(fullText, 0)
          if (!firstDate) {
            // Check class/id hints as last resort
            for (const hint of ['date','when','schedule','event-date','start-date']) {
              for (const el of document.querySelectorAll(`[class*="${hint}"],[id*="${hint}"]`)) {
                const t = el.textContent.trim()
                const d = parseDateAt(t, 0)
                if (d) return { date: d.date }
              }
            }
            return {}
          }

          // Slice text from where we found the date onwards
          const afterDate = fullText.slice(firstDate.index)

          // Extract all times that appear in that section
          const timeRe = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi
          const allTimes = [...afterDate.matchAll(timeRe)]

          // Start time = first time after the date
          const startTime = allTimes.length > 0 ? parseTime(allTimes[0][1]) : ''

          // End time: prefer a time right before "concludes/ends/closing/close"
          const endMarkerRe = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b[^\n]{0,40}(?:concludes?|ends?\b|closing|close\b|end of event|doors close)/gi
          const endMarkers = [...afterDate.matchAll(endMarkerRe)]
          let endTime = ''
          if (endMarkers.length > 0) {
            endTime = parseTime(endMarkers[endMarkers.length - 1][1])
          } else if (allTimes.length > 1) {
            // Fall back: last time in the section
            endTime = parseTime(allTimes[allTimes.length - 1][1])
          }

          return { date: firstDate.date, startTime, endTime }
        }

        const fallback = (!start.date || !start.time) ? textFallback() : {}
        const startResult = {
          date: start.date || fallback.date || '',
          time: start.time || fallback.startTime || '',
        }
        const endResult = {
          date: end.date || startResult.date || '',
          time: end.time || fallback.endTime || '',
        }

        return {
          title:       ld?.name || meta('og:title') || '',
          description: (window.getSelection?.().toString().trim() ||
                        ld?.description || meta('description') || meta('og:description') || '').slice(0, 500),
          organizer:   extractOrganizer(ld?.organizer),
          location:    extractLocation(ld?.location) || meta('og:locality') || meta('og:region') || '',
          format:      extractFormat(ld?.eventAttendanceMode),
          startDate:   startResult.date  || '',
          startTime:   startResult.time  || '',
          endDate:     endResult.date    || '',
          endTime:     endResult.time    || '',
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
}

init()
