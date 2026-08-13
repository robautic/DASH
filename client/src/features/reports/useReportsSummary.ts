import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface ReportsSummary {
  from: string
  to: string
  leads: number
  conversions: number
  conversionRate: number | null
}

export function useReportsSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'summary', from, to],
    queryFn: () => apiClient.get<ReportsSummary>(`/api/reports/summary?from=${from}&to=${to}`),
    enabled: Boolean(from && to),
  })
}
