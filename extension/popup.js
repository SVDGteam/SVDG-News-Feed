const DEFAULT_API_BASE = 'https://svdg-news-feed.vercel.app'

const CATEGORIES = [
  'Industry News',
  'Investor News',
  'Government News',
  'Sponsor News',
  'Opinions',
  'International',
]

const els = {
  form: document.getElementById('clip-form'),
  title: document.getElementById('title'),
  url: document.getElementById('url'),
  source: document.getElementById('source'),
  description: document.getElementById('description'),
  categories: document.getElementById('categories'),
  tags: document.getElementById('tags'),
  submit: document.getElementById('submit-btn'),
  status: document.getElementById('status'),
  openOptions: document.getElementById('open-options'),
}

function renderCategories() {
  CATEGORIES.forEach((label, i) => {
    const id = `cat-${i}`
    const wrapper = document.createElement('label')
    wrapper.innerHTML = `<input type="checkbox" id="${id}" value="${label}" /> ${label}`
    els.categories.appendChild(wrapper)
  })
}

function getCheckedCategories() {
  return Array.from(els.categories.querySelectorAll('input[type="checkbox"]:checked')).map(
    (el) => el.value
  )
}

function setStatus(message, kind) {
  els.status.textContent = message
  els.status.className = `status ${kind || ''}`
}

// Pull a meta description / page excerpt from the active tab to pre-fill
// the description field. Falls back silently if it can't (e.g. chrome:// pages).
async function getPageSummary(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const meta =
          document.querySelector('meta[name="description"]') ||
          document.querySelector('meta[property="og:description"]')
        const selection = window.getSelection ? window.getSelection().toString().trim() : ''
        return selection || (meta && meta.content) || ''
      },
    })
    return result || ''
  } catch {
    return ''
  }
}

async function init() {
  renderCategories()

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab) {
    els.title.value = tab.title || ''
    els.url.value = tab.url || ''
    try {
      els.source.value = new URL(tab.url).hostname.replace(/^www\./, '')
    } catch {
      els.source.value = ''
    }
    els.description.value = await getPageSummary(tab.id)
  }
}

els.openOptions.addEventListener('click', (e) => {
  e.preventDefault()
  chrome.runtime.openOptionsPage()
})

els.form.addEventListener('submit', async (e) => {
  e.preventDefault()
  els.submit.disabled = true
  setStatus('Saving…', '')

  const { apiBase, apiKey } = await chrome.storage.sync.get(['apiBase', 'apiKey'])
  const base = (apiBase || DEFAULT_API_BASE).replace(/\/$/, '')

  const payload = {
    title: els.title.value.trim(),
    url: els.url.value.trim(),
    source: els.source.value.trim(),
    description: els.description.value.trim(),
    categories: getCheckedCategories(),
    tags: els.tags.value.trim(),
  }

  try {
    const res = await fetch(`${base}/api/extension/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (res.status === 401) {
      setStatus('Unauthorized — check your API key in Settings.', 'error')
    } else if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setStatus(data.error || `Failed (${res.status})`, 'error')
    } else {
      setStatus('Added to Dispatch ✓', 'success')
      setTimeout(() => window.close(), 900)
    }
  } catch (err) {
    setStatus('Network error — check Settings for the site URL.', 'error')
  } finally {
    els.submit.disabled = false
  }
})

init()
