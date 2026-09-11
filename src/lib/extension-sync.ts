export type CapturedMessage = {
  id: string
  chatId: string
  name: string
  phone: string
  direction: 'inbound' | 'outbound'
  content: string
  occurredAt: string
}

export function validateCapture(value: unknown): CapturedMessage[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) throw new Error('invalid_batch')
  return value.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('invalid_message')
    const m = item as Record<string, unknown>
    if (typeof m.id !== 'string' || m.id.length > 240 ||
      typeof m.chatId !== 'string' || !/^\d{5,20}@(c\.us|s\.whatsapp\.net|lid)$/.test(m.chatId) ||
      !m.id.startsWith(`${m.direction === 'outbound' ? 'true' : 'false'}_${m.chatId}_`) ||
      !['inbound', 'outbound'].includes(String(m.direction)) ||
      typeof m.content !== 'string' || !m.content.trim() || m.content.length > 10000 ||
      typeof m.name !== 'string' || m.name.length > 100 ||
      typeof m.phone !== 'string' || !/^(\d{5,20})?$/.test(m.phone) ||
      typeof m.occurredAt !== 'string' || !Number.isFinite(Date.parse(m.occurredAt)) ||
      Date.parse(m.occurredAt) > Date.now() + 300000 || Date.parse(m.occurredAt) < Date.UTC(2009, 0, 1)) {
      throw new Error('invalid_message')
    }
    const phone = m.chatId.endsWith('@lid') ? '' : m.chatId.split('@')[0]
    if (m.phone !== phone) throw new Error('invalid_phone')
    return m as CapturedMessage
  })
}
