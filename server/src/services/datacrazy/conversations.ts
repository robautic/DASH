// GET /conversations (lista + filtros) e GET /conversations/{id}.
// A DataCrazy não expõe um GET de mensagens avulso — mensagens chegam via
// webhook (message.created) ou embutidas na própria conversa; ver messages.ts.
import { datacrazyClient } from './client.js'
import type { ConversationDoc } from '../../types/firestore.js'

export interface DataCrazyDepartment {
  id: string
  tenantId: string
  name: string
  color: string
  main: boolean
  createdAt: string
  updatedAt: string
}

export interface DataCrazyConversation {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  attendants: string[]
  currentDepartment?: DataCrazyDepartment
  finished: boolean
  lastMessageDate?: string
  sourceReferral?: { sourceId?: string; sourceUrl?: string; ctwaId?: string }
}

export interface ConversationFilters {
  opened?: boolean
  departments?: string
  attendants?: string
  stages?: string
  tags?: string
  openWindow?: 'last24h' | 'all'
}

const ROUTE = '/api/v1/conversations'

export function getConversations(filters: ConversationFilters = {}, skip = 0, take = 100) {
  return datacrazyClient.get<{ count: number; data: DataCrazyConversation[] }>('api/v1/conversations', {
    routeKey: ROUTE,
    query: { skip, take, filter: JSON.stringify(filters) },
  })
}

export function getConversationById(id: string) {
  return datacrazyClient.get<DataCrazyConversation>(`api/v1/conversations/${id}`, {
    routeKey: `${ROUTE}/:id`,
    dedupeKey: id,
  })
}

/**
 * Mapeia o DTO da DataCrazy para o nosso modelo `conversations` no Firestore.
 * `leadId` não é um campo documentado em GET /conversations — na prática só
 * o vemos vir junto no payload de webhook (mesmo padrão da automação "Next
 * Distribuição Inteligente", que manda leadId+conversationId juntos). Por
 * isso ele é um parâmetro opcional aqui, não algo que a gente lê do DTO.
 */
export function toFirestoreConversation(dto: DataCrazyConversation, leadId: string | null = null): ConversationDoc {
  return {
    id: dto.id,
    leadId,
    name: dto.name,
    attendantIds: dto.attendants ?? [],
    departmentId: dto.currentDepartment?.id ?? null,
    finished: dto.finished,
    lastMessageDate: dto.lastMessageDate ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    syncedAt: new Date().toISOString(),
  }
}
