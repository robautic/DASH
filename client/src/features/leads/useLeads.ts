import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Lead, LeadFilters } from './types'

export function useLeads(filters: LeadFilters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value)
  }

  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => apiClient.get<{ count: number; data: Lead[] }>(`/api/leads?${params.toString()}`),
  })
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => apiClient.get<{ lead: Lead; history: import('./types').LeadHistoryEntry[] }>(`/api/leads/${id}`),
    enabled: Boolean(id),
  })
}

export function useAttendants() {
  return useQuery({
    queryKey: ['attendants'],
    queryFn: () => apiClient.get<import('./types').Attendant[]>('/api/attendants'),
    staleTime: 5 * 60_000,
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => apiClient.get<import('./types').Department[]>('/api/departments'),
    staleTime: 5 * 60_000,
  })
}
