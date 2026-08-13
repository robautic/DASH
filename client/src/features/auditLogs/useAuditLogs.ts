import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface AuditLogEntry {
  userId: string
  action: string
  entity: string
  entityId: string
  before: unknown
  after: unknown
  timestamp: string
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.get<AuditLogEntry[]>('/api/audit-logs'),
  })
}
