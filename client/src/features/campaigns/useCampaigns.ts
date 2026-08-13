import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface CampaignPerformance {
  campaignId: string
  leads: number
  conversions: number
  conversionRate: number | null
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiClient.get<CampaignPerformance[]>('/api/campaigns'),
  })
}
