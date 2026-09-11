chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id || location.origin !== 'https://dash-e-pipe.vercel.app' || location.pathname !== '/extensao') return
  const context = document.getElementById('fluxolu-extension-context')
  if (message?.type === 'FLUXOLU_CONTEXT') {
    respond(context ? { tenantId: context.dataset.tenantId, userId: context.dataset.userId, name: context.dataset.workspaceName } : { error: 'Entre na Fluxolu e abra a página Extensão.' })
  }
  if (message?.type !== 'FLUXOLU_DELIVER') return
  if (!context || message.tenantId !== context.dataset.tenantId || message.userId !== context.dataset.userId) {
    respond({ ok: false, status: 401 }); return
  }
  fetch('/api/extension/sync', {
    method: 'POST', credentials: 'same-origin', redirect: 'error',
    headers: { 'Content-Type': 'application/json', 'X-Fluxolu-Extension': '1' },
    body: JSON.stringify({ tenantId: message.tenantId, userId: message.userId, messages: message.messages }),
    signal: AbortSignal.timeout(15000),
  }).then(async response => respond({ ok: response.ok, status: response.status, ...(response.ok ? await response.json() : {}) }))
    .catch(() => respond({ ok: false, status: 0 }))
  return true
})
