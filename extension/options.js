const KEYS = ['dispatchApiBase', 'dispatchApiKey', 'circuitApiBase', 'circuitApiKey']

async function load() {
  const stored = await chrome.storage.sync.get(KEYS)
  KEYS.forEach(k => {
    const el = document.getElementById(k)
    if (el && stored[k]) el.value = stored[k]
  })
}

document.getElementById('options-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const values = {}
  KEYS.forEach(k => {
    const el = document.getElementById(k)
    if (el && el.value.trim()) values[k] = el.value.trim()
  })
  await chrome.storage.sync.set(values)
  const status = document.getElementById('status')
  status.textContent = 'Saved ✓'
  status.className = 'status success'
  setTimeout(() => { status.textContent = ''; status.className = 'status' }, 2000)
})

load()
