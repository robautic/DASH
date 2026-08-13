// Registro de histórico do lead (ASSIGNED/TRANSFERRED/STATUS_CHANGED/
// TAG_ADDED/TAG_REMOVED/CONVERTED/CLOSED) — usado pelo webhook handler hoje
// e pela API do backend (Fase 4) quando um SUPERVISOR/ADMIN alterar um lead
// manualmente pela interface.
import { collections } from '../../lib/collections.js'
import type { LeadHistoryDoc, LeadHistoryType } from '../../types/firestore.js'

export async function appendLeadHistory(entry: {
  leadId: string
  type: LeadHistoryType
  from?: string | null
  to?: string | null
  performedBy: string
}) {
  const doc: LeadHistoryDoc = {
    leadId: entry.leadId,
    type: entry.type,
    from: entry.from ?? null,
    to: entry.to ?? null,
    performedBy: entry.performedBy,
    createdAt: new Date().toISOString(),
  }
  await collections.leadHistory.add(doc)
}
