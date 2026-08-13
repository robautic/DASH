// Tudo relacionado a leads na API do DataCrazy: GET /leads (lista + filtros),
// GET /leads/{id}, PATCH /leads/{id} (usado, por exemplo, para atribuir
// atendente: { attendant: { id } } — ver docs.datacrazy.io/api-reference/leads/atualizar-lead).
import { datacrazyClient, paginateAll } from './client.js'
import { deriveCampaignKey } from './campaigns.js'
import type { LeadDoc } from '../../types/firestore.js'

export interface DataCrazyAttendant {
  userId: string
  id: string
  name: string
  email: string
  phone?: string
  imageURL?: string
}

export interface DataCrazyTag {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
}

export interface DataCrazySourceReferral {
  sourceId?: string
  sourceUrl?: string
  ctwaId?: string
}

export interface DataCrazyLead {
  id: string
  createdAt: string
  name: string
  phone?: string
  rawPhone?: string
  email?: string
  source?: string
  company?: string
  tags?: DataCrazyTag
  attendant?: DataCrazyAttendant
  sourceReferral?: DataCrazySourceReferral
}

export interface LeadFilters {
  tags?: string
  attendant?: string
  source?: string
  createdAtGreaterOrEqual?: string
  createdAtLessOrEqual?: string
}

const ROUTE = '/api/v1/leads'

export function getLeads(filters: LeadFilters = {}, skip = 0, take = 100) {
  return datacrazyClient.get<{ count: number; data: DataCrazyLead[] }>('api/v1/leads', {
    routeKey: ROUTE,
    query: { skip, take, filter: JSON.stringify(filters) },
  })
}

export function getLeadById(id: string) {
  return datacrazyClient.get<DataCrazyLead>(`api/v1/leads/${id}`, {
    routeKey: `${ROUTE}/:id`,
    dedupeKey: id,
  })
}

/** Atribui um atendente ao lead — usado pela distribuição de leads. */
export function assignAttendant(leadId: string, attendantId: string) {
  return datacrazyClient.patch(`api/v1/leads/${leadId}`, {
    routeKey: `${ROUTE}/:id`,
    body: { attendant: { id: attendantId } },
  })
}

export function updateLead(leadId: string, patch: Record<string, unknown>) {
  return datacrazyClient.patch(`api/v1/leads/${leadId}`, {
    routeKey: `${ROUTE}/:id`,
    body: patch,
  })
}

/** Todas as páginas de leads criados a partir de `since` (import inicial ou catch-up). */
export function iterateLeadsCreatedSince(since?: string) {
  const filters: LeadFilters = since ? { createdAtGreaterOrEqual: since } : {}
  return paginateAll<DataCrazyLead>('api/v1/leads', ROUTE, { filter: JSON.stringify(filters) })
}

// NOTA IMPORTANTE (documentada aqui porque afeta diretamente a estratégia do
// sync worker): a API de leads do DataCrazy não expõe updatedAt nem um filtro
// tipo "alterado desde X" — só createdAtGreaterOrEqual/LessOrEqual. Ou seja,
// não dá pra perguntar "quais leads mudaram desde ontem" via polling.
// Por isso mudanças em leads existentes (reatribuição, conversão, tags) são
// capturadas via webhook (lead.updated/lead.assigned/lead.converted), não via
// polling — o polling deste módulo serve só para achar leads NOVOS.

/**
 * Mapeia o DTO do DataCrazy para os campos do nosso modelo Lead no Firestore
 * (ver types/firestore.ts). Só preenche o que a API de leads realmente
 * entrega — campos que só existem em outros endpoints (department/pipeline/
 * stage vêm de conversations; conversionStatus/convertedAt vêm de
 * conversions) ficam `null` aqui de propósito, para não inventar dado. Eles
 * chegam via webhook/mapeador específico quando esse dado existir — ver
 * mergeLeadUpdate() logo abaixo, usado pra não sobrescrever esses campos com
 * null quando o worker atualiza um lead que já tinha esses dados.
 */
export function toFirestoreLead(dto: DataCrazyLead): LeadDoc {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.rawPhone ?? dto.phone ?? null,
    email: dto.email ?? null,
    attendantId: dto.attendant?.id ?? null,
    departmentId: null,
    status: null,
    pipelineId: null,
    stageId: null,
    campaignId: deriveCampaignKey(dto),
    source: dto.source ?? null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    tags: dto.tags ? [dto.tags.id] : [],
    createdAt: dto.createdAt,
    updatedAt: null,
    lastInteractionAt: null,
    firstResponseAt: null,
    convertedAt: null,
    conversionStatus: null,
    syncedAt: new Date().toISOString(),
  }
}
