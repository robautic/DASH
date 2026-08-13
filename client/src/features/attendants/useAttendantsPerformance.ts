import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface AttendantPerformance {
  attendantId: string
  name: string
  leads: number
  conversions: number
  conversionRate: number | null
}

export function useAttendantsPerformance() {
  return useQuery({
    queryKey: ['attendants', 'performance'],
    queryFn: () => apiClient.get<AttendantPerformance[]>('/api/attendants/performance'),
  })
}

export function useAttendantPerformance(id: string | undefined) {
  return useQuery({
    queryKey: ['attendants', id, 'performance'],
    queryFn: () => apiClient.get<AttendantPerformance>(`/api/attendants/${id}/performance`),
    enabled: Boolean(id),
  })
}
