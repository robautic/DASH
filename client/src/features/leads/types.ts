// Espelha server/src/types/firestore.ts (LeadDoc/LeadHistoryDoc) — o
// frontend não importa do server (pacotes separados), então o formato é
// replicado aqui deliberadamente.
export interface Lead {
  id: string
  name: string
  phone: string | null
  email: string | null
  attendantId: string | null
  departmentId: string | null
  status: string | null
  pipelineId: string | null
  stageId: string | null
  campaignId: string | null
  source: string | null
  tags: string[]
  createdAt: string
  updatedAt: string | null
  lastInteractionAt: string | null
  convertedAt: string | null
  conversionStatus: 'OPEN' | 'CONVERTED' | 'LOST' | null
}

export interface LeadHistoryEntry {
  leadId: string
  type: 'ASSIGNED' | 'TRANSFERRED' | 'STATUS_CHANGED' | 'TAG_ADDED' | 'TAG_REMOVED' | 'CONVERTED' | 'CLOSED'
  from: string | null
  to: string | null
  performedBy: string
  createdAt: string
}

export interface Attendant {
  id: string
  name: string
  email: string
}

export interface Department {
  id: string
  name: string
}

export interface LeadFilters {
  attendantId?: string
  departmentId?: string
  source?: string
  status?: string
}
