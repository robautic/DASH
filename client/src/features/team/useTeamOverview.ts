import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { AttendantPerformance } from '@/features/attendants/useAttendantsPerformance'

export interface TeamOverview {
  leads: number
  conversions: number
  conversionRate: number | null
  attendants: AttendantPerformance[]
}

export function useTeamOverview() {
  return useQuery({
    queryKey: ['team', 'overview'],
    queryFn: () => apiClient.get<TeamOverview>('/api/team/overview'),
  })
}
