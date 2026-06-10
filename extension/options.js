const DEFAULT_API_BASE = 'https://svdg-news-feed.vercel.app'

const els = {
  form: document.getElementById('options-form'),
  apiBase: document.getElementById('apiBase'),
  apiKey: document.getElementById('apiKey'),
  status: document.getElementById('status'),
}

async function load() {
  const { apiBase, apiKey } = await chrome.storage.sync.get(['apiBase', 'apiKey'])
  els.apiBase.value = apiBase || DEFAULT_API_BASE
  els.apiKey.value = apiKey || ''
}

els.form.addEventListener('submit', async (e) => {
  e.preventDefault()
  await chrome.storage.sync.set({
    apiBase: els.apiBase.value.trim().replace(/\/$/, '') || DEFAULT_API_BASE,
    apiKey: els.apiKey.value.trim(),
  })
  els.status.textContent = 'Saved ✓'
  els.status.className = 'status success'
  setTimeout(() => {
    els.status.textContent = ''
  }, 1500)
})

load()
