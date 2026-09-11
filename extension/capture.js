// Deliberately reads rendered text only; no WhatsApp private API or session token.
globalThis.FluxoluCapture = {
  parseTime(value, locale) {
    const match = value.match(/^\[(\d{1,2}):(\d{2})(?:[:]\d{2})?\s*(AM|PM)?,\s*(\d{1,2})[/.](\d{1,2})[/.](\d{4})\]/i)
    if (!match || !/^(pt|en-US|en-GB)(-|$)/i.test(locale)) return null
    let hour = Number(match[1]); const minute = Number(match[2])
    if (match[3]) { if (hour < 1 || hour > 12) return null; hour = hour % 12 + (/pm/i.test(match[3]) ? 12 : 0) }
    const us = /^en-US$/i.test(locale)
    const day = Number(match[us ? 5 : 4]); const month = Number(match[us ? 4 : 5]); const year = Number(match[6])
    const date = new Date(year, month - 1, day, hour, minute)
    if (hour > 23 || minute > 59 || date.getDate() !== day || date.getMonth() !== month - 1 || year < 2009 || date.getTime() > Date.now() + 300000) return null
    return date.toISOString()
  },
  read(root, locale) {
    const main = root.querySelector('#main')
    if (!main) return { messages: [], reason: 'Abra uma conversa individual para acompanhar.' }
    const name = (main.querySelector('header [title]')?.getAttribute('title') || '').trim().slice(0, 100)
    const messages = []
    for (const node of main.querySelectorAll('[data-id]')) {
      const id = node.getAttribute('data-id') || ''
      const match = id.match(/^(true|false)_(\d{5,20}@(c\.us|s\.whatsapp\.net|lid))_([^\s]+)$/)
      if (!match || id.length > 240) continue
      const contentNode = node.querySelector('[data-pre-plain-text]')
      const text = contentNode?.querySelector('.selectable-text')?.textContent?.trim()
      const occurredAt = this.parseTime(contentNode?.getAttribute('data-pre-plain-text') || '', locale)
      if (!text || text.length > 10000 || !occurredAt) continue
      messages.push({ id, chatId: match[2], phone: match[3] === 'lid' ? '' : match[2].split('@')[0], name, direction: match[1] === 'true' ? 'outbound' : 'inbound', content: text, occurredAt })
    }
    // Mixed identities indicate a transitional DOM. Do not assign a header to another chat.
    if (new Set(messages.map(m => m.chatId)).size > 1) return { messages: [], reason: 'Aguardando a conversa terminar de carregar.' }
    return { messages, reason: messages.length ? 'Acompanhando textos da conversa aberta.' : 'Nenhum texto compatível carregado. Grupos e mídias não são capturados.' }
  },
}
