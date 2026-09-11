function normalizePhone(text = '') {
  const match = text.match(/\+?\d[\d\s().-]{7,}\d/)
  return match ? match[0].trim() : ''
}

function getConversationContext() {
  const header = document.querySelector('#main header')
  const candidates = header ? [...header.querySelectorAll('[title], span, div')] : []
  const texts = candidates.map((el) => (el.getAttribute?.('title') || el.textContent || '').trim()).filter(Boolean)
  const phone = texts.map(normalizePhone).find(Boolean) || ''
  const name = texts.find((text) => text.length > 1 && text.length < 80 && !normalizePhone(text) && !/online|digitando|typing|visto por último|last seen/i.test(text)) || ''
  return { name, phone, pageTitle: document.title, url: location.href }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'DASH_PIPE_GET_CONTEXT') sendResponse(getConversationContext())
})

if (!document.getElementById('dash-pipe-companion-launcher')) {
  const host = document.createElement('div')
  host.id = 'dash-pipe-companion-launcher'
  host.style.position = 'fixed'
  host.style.right = '18px'
  host.style.bottom = '92px'
  host.style.zIndex = '2147483647'
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      button{width:46px;height:46px;border:0;border-radius:15px;background:#d8ff72;color:#111214;font:900 16px system-ui;box-shadow:0 12px 30px rgba(0,0,0,.28);cursor:pointer;transition:.18s transform}
      button:hover{transform:translateY(-2px)}
    </style>
    <button type="button" title="Abrir Fluxolu">F</button>`
  shadow.querySelector('button').addEventListener('click', () => chrome.runtime.sendMessage({ type: 'DASH_PIPE_OPEN_SIDE_PANEL' }))
  document.documentElement.appendChild(host)
}

let captureBusy = false
let captureGeneration = ''
const acknowledged = new Set()
async function syncVisibleMessages() {
  if (captureBusy) return
  captureBusy = true
  try {
    const state = await chrome.runtime.sendMessage({ type: 'FLUXOLU_STATE' })
    if (!state?.enabled) return
    if (captureGeneration !== state.generation) { acknowledged.clear(); captureGeneration = state.generation }
    const snapshot = globalThis.FluxoluCapture.read(document, document.documentElement.lang || navigator.language)
    const messages = snapshot.messages.filter(m => !acknowledged.has(m.id)).slice(0, 50)
    if (!messages.length) return
    const result = await chrome.runtime.sendMessage({ type: 'FLUXOLU_CAPTURE', generation: captureGeneration, messages })
    if (result?.ok) for (const message of messages) acknowledged.add(message.id)
    // Bound memory. Database idempotency also protects messages observed again.
    if (acknowledged.size > 5000) acknowledged.clear()
  } catch { /* An extension reload invalidates this script; reloading WhatsApp restores it. */ }
  finally { captureBusy = false }
}
let captureTimer
const observer = new MutationObserver(() => {
  if (captureTimer) return
  captureTimer = setTimeout(() => { captureTimer = null; void syncVisibleMessages() }, 1000)
})
observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true })
setInterval(syncVisibleMessages, 5000)
void syncVisibleMessages()
