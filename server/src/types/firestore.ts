// Tipos canônicos de cada coleção do Firestore (ver spec do projeto). Este é
// o "modelo" da Fase 3 — server/lib/collections.ts usa esses tipos pra criar
// referências tipadas, e o resto do backend importa daqui, nunca duplica.
//
// Convenção: todo relacionamento é por ID (attendantId, departmentId,
// campaignId, pipelineId, stageId) — nunca por nome. Campos que a API do
// DataCrazy não entrega diretamente ficam `| null`, nunca com valor
// inventado (ver notas em services/datacrazy/*.ts sobre o que cada endpoint
// realmente fornece).

export type Role = 'ADMIN' | 'SUPERVISOR' | 'ATTENDANT' | 'VIEWER'

export interface UserDoc {
  id: string // uid do Firebase Auth
  email: string
  role: Role
  departmentIds: string[] // relevante só pra SUPERVISOR
  attendantId: string | null // liga o usuário ao AttendantDto do DataCrazy (ATTENDANT)
  createdAt: string
  updatedAt: string
}

export interface DepartmentDoc {
  id: string
  name: string
  color: string | null
  main: boolean
  createdAt: string
  updatedAt: string
  syncedAt: string
}

export type ConversionStatus = 'OPEN' | 'CONVERTED' | 'LOST' | null

export interface LeadDoc {
  id: string
  name: string
  phone: string | null
  email: string | null
  attendantId: string | null
  departmentId: string | null // só disponível via conversation associada — ver conversations.ts
  status: string | null
  pipelineId: string | null
  stageId: string | null
  campaignId: string | null
  source: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
  tags: string[]
  createdAt: string
  updatedAt: string | null
  lastInteractionAt: string | null
  firstResponseAt: string | null
  convertedAt: string | null
  conversionStatus: ConversionStatus
  syncedAt: string
  /** true quando um webhook "raso" chegou e ainda não buscamos o lead completo via GET /leads/{id}. */
  pendingFullSync?: boolean
}

export interface ConversationDoc {
  id: string
  leadId: string | null // ver nota em conversations.ts — não é um campo documentado da API, vem do contexto do webhook
  name: string
  attendantIds: string[]
  departmentId: string | null
  finished: boolean
  lastMessageDate: string | null
  createdAt: string
  updatedAt: string
  syncedAt: string
  pendingFullSync?: boolean
}

export interface MessageDoc {
  id: string
  conversationId: string
  leadId: string | null
  text: string | null
  fromMe: boolean
  createdAt: string
  syncedAt: string
}

export interface AttendantDoc {
  id: string
  userId: string
  name: string
  email: string
  phone: string | null
  imageURL: string | null
  syncedAt: string
}

export interface CampaignDoc {
  id: string // deriveCampaignKey() — ver services/datacrazy/campaigns.ts
  source: string | null
  medium: string | null
  campaign: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  // Métricas agregadas: calculadas na Fase 7 a partir de leads/conversions
  // (nunca escritas "na mão" aqui pra não inventar número).
  leadsCount: number
  conversionsCount: number
  conversionRate: number | null
  cost: number | null
  cpa: number | null
  revenue: number | null
  roi: number | null
  updatedAt: string
}

export interface ConversionDoc {
  id: string
  leadId: string
  attendantId: string | null
  departmentId: string | null
  campaignId: string | null
  value: number | null // DataCrazy não manda valor no evento lead.converted — fica null até existir essa informação
  status: 'CONVERTED'
  convertedAt: string
}

export interface PipelineDoc {
  id: string
  name: string
  group: string | null
  syncedAt: string
}

export interface StageDoc {
  id: string
  pipelineId: string
  name: string
  color: string | null
  index: number
  syncedAt: string
}

export interface TagDoc {
  id: string
  name: string
  color: string
  description: string | null
  createdAt: string
  syncedAt: string
}

export type LeadHistoryType =
  | 'ASSIGNED'
  | 'TRANSFERRED'
  | 'STATUS_CHANGED'
  | 'TAG_ADDED'
  | 'TAG_REMOVED'
  | 'CONVERTED'
  | 'CLOSED'

export interface LeadHistoryDoc {
  leadId: string
  type: LeadHistoryType
  from: string | null
  to: string | null
  performedBy: string
  createdAt: string
}

export interface GoalDoc {
  id: string
  attendantId: string | null // meta individual
  departmentId: string | null // meta de departamento
  period: string // ex.: "2026-08"
  target: number
  metric: 'leads' | 'conversions' | 'revenue'
  createdAt: string
  updatedAt: string
}

/** Documento agregado por dia/atendente/departamento/campanha — ver Fase 7. */
export interface MetricDoc {
  id: string // ex.: "2026-08-08:attendant:att-123"
  date: string
  scope: 'day' | 'attendant' | 'department' | 'campaign'
  scopeId: string | null
  leads: number
  conversations: number
  conversions: number
  revenue: number | null
  averageResponseTime: number | null
  averageServiceTime: number | null
  conversionRate: number | null
  sla: number | null
  computedAt: string
}

export interface SyncStateDoc {
  lastSuccessfulSync: string | null
  lastAttempt: string
  status: 'success' | 'error' | 'running'
  error: string | null
  recordsProcessed: number
  duration: number
}

export interface AuditLogDoc {
  userId: string
  action: string
  entity: string
  entityId: string
  before: unknown
  after: unknown
  timestamp: string
}

export interface SettingsDoc {
  id: string
  value: unknown
  updatedAt: string
}
