import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { validateCapture } from '../src/lib/extension-sync.ts'

const captured = { id: 'false_5511999990000@c.us_A1', chatId: '5511999990000@c.us', name: 'Teste', phone: '5511999990000', direction: 'inbound', content: 'Olá', occurredAt: '2026-01-02T12:00:00.000Z' }
const sandbox = { Date, Set }; vm.createContext(sandbox)
vm.runInContext(readFileSync(new URL('../extension/capture.js', import.meta.url), 'utf8'), sandbox)
const capture = sandbox.FluxoluCapture
test('validates a captured text and rejects mismatched contact/direction', () => {
  assert.equal(validateCapture([captured]).length, 1)
  for (const change of [{ chatId: '5511888880000@c.us' }, { direction: 'outbound' }, { phone: '123456' }, { content: '' }, { occurredAt: 'bad' }]) assert.throws(() => validateCapture([{ ...captured, ...change }]))
})
test('rejects oversized batches, groups, future dates and unbounded content', () => {
  for (const data of [[], Array(51).fill(captured), [{ ...captured, chatId: '5511999990000@g.us' }], [{ ...captured, content: 'x'.repeat(10001) }], [{ ...captured, occurredAt: '2099-01-01T00:00:00Z' }]]) assert.throws(() => validateCapture(data))
})
test('LID is a stable identity but never inferred as a phone', () => {
  const lid = { ...captured, id: 'false_123456789@lid_A', chatId: '123456789@lid', phone: '' }
  assert.equal(validateCapture([lid])[0].phone, '')
  assert.throws(() => validateCapture([{ ...lid, phone: '123456789' }]))
})
test('parses supported locales and rejects ambiguous/invalid dates', () => {
  assert.equal(new Date(capture.parseTime('[14:30, 02/01/2026] Teste:', 'pt-BR')).getMonth(), 0)
  assert.equal(new Date(capture.parseTime('[2:30 PM, 01/02/2026] Test:', 'en-US')).getHours(), 14)
  assert.equal(capture.parseTime('[14:30, 31/02/2026] Teste:', 'pt-BR'), null)
  assert.equal(capture.parseTime('[14:30, 02/01/2026] Test:', 'en'), null)
})
function rootFor(rows) {
  return { querySelector: () => ({ querySelector: () => ({ getAttribute: () => 'Cliente' }), querySelectorAll: () => rows.map(([id, text]) => ({ getAttribute: () => id, querySelector: () => ({ getAttribute: () => '[14:30, 02/01/2026] Cliente:', querySelector: () => ({ textContent: text }) }) })) }) }
}
test('captures stable individual text IDs; ignores groups/media and transitional mixed chats', () => {
  assert.equal(capture.read(rootFor([[captured.id, 'Olá']]), 'pt-BR').messages.length, 1)
  assert.equal(capture.read(rootFor([['false_12345@g.us_A', 'grupo']]), 'pt-BR').messages.length, 0)
  assert.equal(capture.read(rootFor([[captured.id, '']]), 'pt-BR').messages.length, 0)
  assert.equal(capture.read(rootFor([[captured.id, 'Olá'], ['false_5511888880000@c.us_B', 'Outro']]), 'pt-BR').messages.length, 0)
})

function worker() {
  let listener; let alarm; let result = { ok: true }; const session = {}; const sent = []
  const chrome = {
    runtime: { id: 'test', getURL: () => 'chrome-extension://test/', onInstalled: { addListener() {} }, onMessage: { addListener(fn) { listener = fn } } },
    sidePanel: {}, alarms: { onAlarm: { addListener(fn) { alarm = fn } } },
    storage: { session: { async get(key) { return structuredClone({ [key]: session[key] }) }, async set(value) { Object.assign(session, structuredClone(value)) } } },
    tabs: { onRemoved: { addListener() {} }, async query({ url }) { return [{ id: url.includes('whatsapp') ? 2 : 1 }] }, async sendMessage(id, message) { if (message.type === 'FLUXOLU_CONTEXT') return { tenantId: 'tenant-a', userId: 'user-a', name: 'Empresa A' }; sent.push(message); return result } },
  }
  vm.runInNewContext(readFileSync(new URL('../extension/background.js', import.meta.url), 'utf8'), { chrome, crypto: { randomUUID: () => 'generation-a' }, Set, Date })
  const panel = { id: 'test', url: 'chrome-extension://test/sidepanel.html' }
  const wa = { id: 'test', url: 'https://web.whatsapp.com/', tab: { id: 2 } }
  const send = (message, sender = panel) => new Promise(resolve => { if (!listener(message, sender, resolve)) resolve(undefined) })
  return { send, wa, sent, session, setResult(value) { result = value }, alarm: () => alarm({ name: 'fluxolu-retry' }) }
}
test('worker only accepts explicit activation and the bound WhatsApp tab', async () => {
  const w = worker()
  assert.equal((await w.send({ type: 'FLUXOLU_CAPTURE', messages: [captured] }, w.wa)).ok, false)
  await w.send({ type: 'FLUXOLU_PREPARE' }); await w.send({ type: 'FLUXOLU_ENABLE' })
  assert.equal((await w.send({ type: 'FLUXOLU_CAPTURE', generation: 'generation-a', messages: [captured] }, { ...w.wa, tab: { id: 3 } })).ok, false)
  assert.equal((await w.send({ type: 'FLUXOLU_CAPTURE', generation: 'generation-a', messages: [captured] }, w.wa)).ok, true)
  assert.equal(w.sent[0].tenantId, 'tenant-a')
  assert.equal(w.session.sync.queue.length, 0)
})
test('worker preserves failed deliveries, deduplicates queue and clears it on pause', async () => {
  const w = worker(); await w.send({ type: 'FLUXOLU_PREPARE' }); await w.send({ type: 'FLUXOLU_ENABLE' }); w.setResult({ ok: false, status: 0 })
  for (let i=0;i<2;i++) await w.send({ type: 'FLUXOLU_CAPTURE', generation: 'generation-a', messages: [captured] }, w.wa)
  assert.equal(w.session.sync.queue.length, 1)
  w.setResult({ ok: true }); w.alarm(); await w.send({ type: 'FLUXOLU_STATE' })
  assert.equal(w.session.sync.queue.length, 0)
  await w.send({ type: 'FLUXOLU_PAUSE' }); assert.equal(w.session.sync.enabled, false)
})
test('session/auth failures stop collection instead of switching workspace', async () => {
  const w = worker(); await w.send({ type: 'FLUXOLU_PREPARE' }); await w.send({ type: 'FLUXOLU_ENABLE' }); w.setResult({ ok: false, status: 401 })
  await w.send({ type: 'FLUXOLU_CAPTURE', generation: 'generation-a', messages: [captured] }, w.wa)
  assert.equal(w.session.sync.enabled, false)
  assert.equal(w.session.sync.tenantId, 'tenant-a')
})

test('app bridge pins delivery to the displayed user and tenant with same-origin credentials', async () => {
  let listener; const requests = []
  const context = { dataset: { tenantId: 'tenant-a', userId: 'user-a' } }
  vm.runInNewContext(readFileSync(new URL('../extension/app-bridge.js', import.meta.url), 'utf8'), {
    chrome: { runtime: { id: 'test', onMessage: { addListener(fn) { listener = fn } } } },
    location: { origin: 'https://dash-e-pipe.vercel.app', pathname: '/extensao' },
    document: { getElementById: () => context }, AbortSignal,
    fetch: async (url, options) => { requests.push({ url, options }); return { ok: true, status: 200, json: async () => ({ ok: true }) } },
  })
  const send = message => new Promise(resolve => listener(message, { id: 'test' }, resolve))
  assert.equal((await send({ type: 'FLUXOLU_DELIVER', tenantId: 'tenant-b', userId: 'user-a', messages: [captured] })).status, 401)
  assert.equal(requests.length, 0)
  assert.equal((await send({ type: 'FLUXOLU_DELIVER', tenantId: 'tenant-a', userId: 'user-a', messages: [captured] })).ok, true)
  assert.equal(requests[0].url, '/api/extension/sync')
  assert.equal(requests[0].options.credentials, 'same-origin')
  assert.equal(requests[0].options.redirect, 'error')
})
