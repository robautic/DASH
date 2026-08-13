// A DataCrazy não tem uma API de "assinar webhook" — o disparo é configurado
// como uma automação dentro do próprio DataCrazy (bloco de API HTTP chamando
// uma URL nossa quando um evento acontece — é exatamente o padrão já usado
// na automação "Next Distribuição Inteligente"). Este módulo normaliza o
// payload que chega nesse POST para um formato único, usado pela rota HTTP
// (server/webhooks/router.ts) e, no futuro, também pelo sync worker.
export type DataCrazyWebhookEventType =
  | 'lead.created'
  | 'lead.updated'
  | 'lead.assigned'
  | 'conversation.created'
  | 'conversation.updated'
  | 'message.created'
  | 'lead.converted'

export interface DataCrazyWebhookEvent<TData = unknown> {
  type: DataCrazyWebhookEventType
  data: TData
  receivedAt: string
}

const KNOWN_EVENTS: readonly DataCrazyWebhookEventType[] = [
  'lead.created',
  'lead.updated',
  'lead.assigned',
  'conversation.created',
  'conversation.updated',
  'message.created',
  'lead.converted',
]

export function isKnownEventType(type: string): type is DataCrazyWebhookEventType {
  return (KNOWN_EVENTS as string[]).includes(type)
}

/**
 * Normaliza o corpo cru recebido no POST do webhook. Lança se o payload não
 * tiver um `type` reconhecido — a rota decide o que fazer com isso (hoje:
 * responde 400 e não tenta adivinhar).
 */
export function parseWebhookEvent(raw: unknown): DataCrazyWebhookEvent {
  if (typeof raw !== 'object' || raw === null || !('type' in raw)) {
    throw new Error('Payload de webhook sem campo "type"')
  }
  const type = (raw as { type: unknown }).type
  if (typeof type !== 'string' || !isKnownEventType(type)) {
    throw new Error(`Tipo de evento de webhook desconhecido: ${String(type)}`)
  }
  return {
    type,
    data: (raw as { data?: unknown }).data ?? raw,
    receivedAt: new Date().toISOString(),
  }
}
