// A API do DataCrazy não expõe um GET de listagem de mensagens — mensagens
// só chegam de forma reativa via webhook (`message.created`, ver
// webhooks.ts) ou são enviadas via POST /conversations/{id}/messages
// (implementação de envio fica para quando o LeadDash precisar responder
// leads pela própria interface — fora do escopo das Fases 1-2).
// Este módulo hoje só define o mapeamento do payload de webhook para o
// nosso modelo `messages` no Firestore.
export interface DataCrazyMessageWebhookPayload {
  id: string
  conversationId: string
  leadId?: string
  text?: string
  fromMe: boolean
  createdAt: string
}

export function toFirestoreMessage(payload: DataCrazyMessageWebhookPayload) {
  return {
    id: payload.id,
    conversationId: payload.conversationId,
    leadId: payload.leadId ?? null,
    text: payload.text ?? null,
    fromMe: payload.fromMe,
    createdAt: payload.createdAt,
    syncedAt: new Date().toISOString(),
  }
}
