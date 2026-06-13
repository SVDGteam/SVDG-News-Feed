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
        return {
          description: window.getSelection?.().toString().trim() ||
                       meta('description') || meta('og:description'),
          location:    meta('og:locality') || meta('og:region') || '',
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
  c.title.value     = tab.title || ''
  c.url.value       = tab.url || ''
  c.organizer.value = hostname
  c.location.value  = pageInfo.location || ''
}

init()
