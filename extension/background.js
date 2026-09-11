const APP = 'https://dash-e-pipe.vercel.app'
let serial = Promise.resolve()
const run = task => { const next = serial.then(task); serial = next.catch(() => {}); return next }
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})
  chrome.alarms.create('fluxolu-retry', { periodInMinutes: 1 })
})
async function state() { return (await chrome.storage.session.get('sync')).sync || { enabled: false, queue: [], status: 'Sincronização pausada.' } }
async function save(value) { await chrome.storage.session.set({ sync: value }) }
async function deliver(s) {
  if (!s.enabled || !s.queue.length) return s
  try {
    const result = await chrome.tabs.sendMessage(s.appTabId, { type: 'FLUXOLU_DELIVER', tenantId: s.tenantId, userId: s.userId, messages: s.queue.slice(0, 50) })
    if (result?.ok) {
      s.queue.splice(0, 50); s.lastSync = new Date().toISOString()
      s.status = s.queue.length ? 'Enviando mensagens pendentes…' : 'Sincronização em dia.'
    } else {
      if ([401, 403, 400].includes(result?.status)) s.enabled = false
      s.status = [401, 403].includes(result?.status) ? 'Sessão ou permissão alterada. Entre na conta correta e ative novamente.' : result?.status === 400 ? 'Formato não reconhecido. Sincronização pausada.' : 'Sem conexão. Tentaremos novamente; mantenha as abas abertas.'
    }
  } catch { s.status = 'Abra novamente a página Extensão da Fluxolu e reative a sincronização.' }
  await save(s); return s
}
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'fluxolu-retry') void run(async () => deliver(await state())) })
chrome.tabs.onRemoved.addListener(tabId => { void run(async () => {
  const s = await state()
  if (s.waTabId === tabId || s.appTabId === tabId) await save({ enabled: false, queue: [], status: 'Uma aba foi fechada. Abra as duas abas e ative novamente.' })
}) })
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id) return
  const internal = !sender.tab && sender.url?.startsWith(chrome.runtime.getURL(''))
  const whatsapp = sender.tab && sender.url?.startsWith('https://web.whatsapp.com/')
  if (message?.type === 'DASH_PIPE_OPEN_SIDE_PANEL' && whatsapp) {
    chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => respond({ ok: true })).catch(() => respond({ ok: false })); return true
  }
  if (!internal && !whatsapp) return
  run(async () => {
    let s = await state()
    if (message.type === 'FLUXOLU_STATE') return internal ? { ...s, queue: undefined, pending: s.queue.length } : { enabled: s.enabled && sender.tab.id === s.waTabId, generation: s.generation }
    if (message.type === 'FLUXOLU_PREPARE' && internal) {
      const apps = await chrome.tabs.query({ url: `${APP}/extensao` })
      const wa = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' })
      if (apps.length !== 1 || wa.length !== 1) throw new Error('Deixe exatamente uma aba Extensão da Fluxolu e uma do WhatsApp Web abertas.')
      const context = await chrome.tabs.sendMessage(apps[0].id, { type: 'FLUXOLU_CONTEXT' })
      if (!context?.tenantId || !context?.userId) throw new Error('Entre na Fluxolu e abra a página Extensão.')
      const prepared = { ...context, appTabId: apps[0].id, waTabId: wa[0].id }
      await chrome.storage.session.set({ prepared }); return prepared
    }
    if (message.type === 'FLUXOLU_ENABLE' && internal) {
      const { prepared } = await chrome.storage.session.get('prepared')
      if (!prepared) throw new Error('Confira o workspace antes de ativar.')
      const current = await chrome.tabs.sendMessage(prepared.appTabId, { type: 'FLUXOLU_CONTEXT' })
      if (current?.userId !== prepared.userId || current?.tenantId !== prepared.tenantId) throw new Error('A conta mudou. Confira novamente o workspace.')
      s = { ...prepared, enabled: true, generation: crypto.randomUUID(), queue: [], status: 'Ativa. Abra uma conversa individual no WhatsApp.' }
      await save(s); return { ok: true }
    }
    if (message.type === 'FLUXOLU_PAUSE' && internal) { await save({ enabled: false, queue: [], status: 'Sincronização pausada. Fila local descartada.' }); return { ok: true } }
    if (message.type === 'FLUXOLU_CAPTURE' && whatsapp && s.enabled && s.waTabId === sender.tab.id && s.generation === message.generation) {
      if (!Array.isArray(message.messages) || message.messages.length > 50 || JSON.stringify(message.messages).length > 600000) throw new Error('Lote inválido.')
      const ids = new Set(s.queue.map(m => m.id))
      const additions = message.messages.filter(m => !ids.has(m.id))
      if (s.queue.length + additions.length > 500) { await deliver(s); return { ok: false, error: 'Fila cheia. Aguarde a conexão voltar.' } }
      s.queue.push(...additions); await save(s); await deliver(s); return { ok: true }
    }
    return { ok: false }
  }).then(respond).catch(error => respond({ ok: false, error: error.message || 'Falha na sincronização.' }))
  return true
})
