import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface ConversionFunnel {
  leads: number
  atendidos: number
  qualificados: number | null
  oportunidades: number | null
  conversoes: number
}

export function useFunnel() {
  return useQuery({
    queryKey: ['conversions', 'funnel'],
    queryFn: () => apiClient.get<ConversionFunnel>('/api/conversions/funnel'),
  })
}
