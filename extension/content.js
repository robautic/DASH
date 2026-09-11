function normalizePhone(text = '') {
  const match = text.match(/\+?\d[\d\s().-]{7,}\d/)
  return match ? match[0].trim() : ''
}

function getConversationContext() {
  const header = document.querySelector('header')
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
