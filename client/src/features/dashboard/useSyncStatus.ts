import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface SyncStatus {
  lastSuccessfulSync: string | null
  status: 'success' | 'error' | 'running' | null
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: () => apiClient.get<SyncStatus>('/api/sync-status'),
    refetchInterval: 60_000,
  })
}
