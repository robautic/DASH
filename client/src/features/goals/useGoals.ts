import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

export interface Goal {
  id: string
  attendantId: string | null
  departmentId: string | null
  period: string
  target: number
  metric: 'leads' | 'conversions' | 'revenue'
  actual: number | null
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => apiClient.get<Goal[]>('/api/goals'),
  })
}

export interface NewGoal {
  attendantId?: string
  departmentId?: string
  period: string
  target: number
  metric: 'leads' | 'conversions' | 'revenue'
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (goal: NewGoal) => apiClient.post<Goal>('/api/goals', goal),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}
