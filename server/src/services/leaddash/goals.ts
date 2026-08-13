// Cálculo de progresso de uma meta — sempre contagem real dentro do período
// (createdAt pra leads, convertedAt pra conversões). Meta de `revenue` fica
// sempre com `actual: null`: nenhuma conversão tem valor monetário
// preenchido hoje (ver services/datacrazy/leads.ts — o DataCrazy não manda
// isso), então não tem como calcular honestamente.
import { collections } from '../../lib/collections.js'
import { parsePeriod } from '../../lib/period.js'
import type { GoalDoc } from '../../types/firestore.js'

export interface GoalWithProgress extends GoalDoc {
  actual: number | null
}

export async function computeGoalProgress(goal: GoalDoc): Promise<number | null> {
  if (goal.metric === 'revenue') return null

  const range = parsePeriod(goal.period)
  if (!range) return null

  const dateField = goal.metric === 'leads' ? 'createdAt' : 'convertedAt'
  const collection = goal.metric === 'leads' ? collections.leads : collections.conversions
  const ownerField = goal.attendantId ? 'attendantId' : goal.departmentId ? 'departmentId' : null
  const ownerValue = goal.attendantId ?? goal.departmentId
  if (!ownerField || !ownerValue) return null

  const snap = await collection
    .where(ownerField, '==', ownerValue)
    .where(dateField, '>=', range.start)
    .where(dateField, '<', range.end)
    .count()
    .get()

  return snap.data().count
}

export async function attachProgress(goals: GoalDoc[]): Promise<GoalWithProgress[]> {
  return Promise.all(
    goals.map(async (goal) => ({ ...goal, actual: await computeGoalProgress(goal) })),
  )
}
