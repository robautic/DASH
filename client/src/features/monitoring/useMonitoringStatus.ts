import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface MonitoringStatus {
  firestore: { status: string }
  datacrazy: { status: string | null; inferredFrom: string }
  sync: {
    lastSuccessfulSync: string | null
    lastAttempt: string | null
    status: string | null
    error: string | null
    recordsProcessed: number | null
    duration: number | null
  }
  rateLimiter: { totalRequests: number; rateLimited429Count: number; retryExhaustedCount: number }
}

export function useMonitoringStatus() {
  return useQuery({
    queryKey: ['monitoring', 'status'],
    queryFn: () => apiClient.get<MonitoringStatus>('/api/monitoring/status'),
    refetchInterval: 30_000,
  })
}
