import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface DashboardKpis {
  leads: number
  conversions: number
  conversionRate: number | null
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => apiClient.get<DashboardKpis>('/api/dashboard/kpis'),
  })
}
