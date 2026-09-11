const DEFAULT_APP_URL = 'https://dash-e-pipe.vercel.app'
const nameEl = document.getElementById('contact-name')
const phoneEl = document.getElementById('contact-phone')
const statusEl = document.getElementById('status')
const urlEl = document.getElementById('app-url')
let context = { name: '', phone: '' }

async function loadSettings() {
  const { appUrl } = await chrome.storage.sync.get({ appUrl: DEFAULT_APP_URL })
  urlEl.value = appUrl
}

async function readContext() {
  statusEl.textContent = 'Lendo a conversa aberta…'
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id || !tab.url?.startsWith('https://web.whatsapp.com/')) {
    nameEl.textContent = 'Abra o WhatsApp Web'
    phoneEl.textContent = 'A extensão funciona ao lado de uma conversa do WhatsApp Web.'
    statusEl.textContent = ''
    return
  }
  try {
    context = await chrome.tabs.sendMessage(tab.id, { type: 'DASH_PIPE_GET_CONTEXT' }) || { name: '', phone: '' }
    nameEl.textContent = context.name || context.phone || 'Conversa atual'
    phoneEl.textContent = context.phone || 'Telefone não identificado — a busca usará o nome.'
    statusEl.textContent = 'Contexto atualizado.'
  } catch {
    statusEl.textContent = 'Recarregue o WhatsApp Web após instalar a extensão.'
  }
}

document.getElementById('open-app').addEventListener('click', async () => {
  const { appUrl } = await chrome.storage.sync.get({ appUrl: DEFAULT_APP_URL })
  const query = context.phone || context.name || ''
  const target = `${String(appUrl).replace(/\/$/, '')}/conversas?search=${encodeURIComponent(query)}`
  chrome.tabs.create({ url: target })
})

document.getElementById('refresh').addEventListener('click', readContext)
document.getElementById('save-url').addEventListener('click', async () => {
  const appUrl = urlEl.value.trim().replace(/\/$/, '')
  if (!/^https:\/\//i.test(appUrl)) {
    statusEl.textContent = 'Use uma URL HTTPS válida.'
    return
  }
  await chrome.storage.sync.set({ appUrl })
  statusEl.textContent = 'URL salva.'
})

loadSettings().then(readContext)

const syncStatus = document.getElementById('sync-status')
async function syncAction(type) {
  try {
    const result = await chrome.runtime.sendMessage({ type })
    if (result?.error) throw new Error(result.error)
    return result
  } catch (error) { syncStatus.textContent = error.message; return null }
}
document.getElementById('open-bridge').addEventListener('click', () => chrome.tabs.create({ url: `${DEFAULT_APP_URL}/extensao` }))
document.getElementById('prepare-sync').addEventListener('click', async () => {
  const result = await syncAction('FLUXOLU_PREPARE')
  document.getElementById('enable-sync').disabled = !result?.tenantId
  document.getElementById('sync-workspace').textContent = result?.name ? `Enviar para: ${result.name}` : ''
})
document.getElementById('enable-sync').addEventListener('click', async () => {
  await syncAction('FLUXOLU_ENABLE'); document.getElementById('enable-sync').disabled = true; await showSyncState()
})
document.getElementById('pause-sync').addEventListener('click', async () => { await syncAction('FLUXOLU_PAUSE'); await showSyncState() })
async function showSyncState() {
  const s = await syncAction('FLUXOLU_STATE')
  if (s) syncStatus.textContent = `${s.status || ''}${s.pending ? ` ${s.pending} pendentes.` : ''}${s.lastSync ? ` Último envio: ${new Date(s.lastSync).toLocaleTimeString()}.` : ''}`
}
setInterval(showSyncState, 3000)
void showSyncState()
