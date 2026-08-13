// Metas (Fase 7). ADMIN cria/edita; cada role vê seu próprio escopo — mesmo
// padrão de authz do resto da API. Progresso é sempre calculado na hora
// (ver services/leaddash/goals.ts), nunca armazenado, pra nunca ficar
// desatualizado.
import { Router } from 'express'
import { collections } from '../lib/collections.js'
import { requireRole } from '../middleware/auth.js'
import { appendAuditLog } from '../services/leaddash/auditLog.js'
import { attachProgress } from '../services/leaddash/goals.js'
import { parsePeriod } from '../lib/period.js'
import type { GoalDoc } from '../types/firestore.js'

export const goalsRouter = Router()

const VALID_METRICS = ['leads', 'conversions', 'revenue'] as const

goalsRouter.get('/goals', async (req, res) => {
  const user = req.authUser!
  let query: FirebaseFirestore.Query<GoalDoc> = collections.goals

  if (user.role === 'ATTENDANT') {
    if (!user.attendantId) {
      res.json([])
      return
    }
    query = query.where('attendantId', '==', user.attendantId)
  } else if (user.role === 'SUPERVISOR') {
    if (user.departmentIds.length === 0) {
      res.json([])
      return
    }
    // Só metas de departamento — não há vínculo attendantId -> departmentId
    // confiável no DataCrazy pra escopar metas individuais com precisão
    // (mesma limitação documentada em services/leaddash/performance.ts).
    query = query.where('departmentId', 'in', user.departmentIds.slice(0, 30))
  }
  // ADMIN/VIEWER: sem filtro, vê tudo.

  const snap = await query.get()
  res.json(await attachProgress(snap.docs.map((d) => d.data())))
})

goalsRouter.post('/goals', requireRole('ADMIN'), async (req, res) => {
  const { attendantId, departmentId, period, target, metric } = req.body ?? {}

  if (!parsePeriod(period)) {
    res.status(400).json({ error: 'period deve estar no formato YYYY-MM' })
    return
  }
  if (!VALID_METRICS.includes(metric)) {
    res.status(400).json({ error: `metric deve ser um de: ${VALID_METRICS.join(', ')}` })
    return
  }
  if (typeof target !== 'number' || target <= 0) {
    res.status(400).json({ error: 'target deve ser um número positivo' })
    return
  }
  const hasAttendant = typeof attendantId === 'string' && attendantId
  const hasDepartment = typeof departmentId === 'string' && departmentId
  if (hasAttendant === hasDepartment) {
    res.status(400).json({ error: 'informe exatamente um de attendantId ou departmentId' })
    return
  }

  const now = new Date().toISOString()
  const ref = collections.goals.doc()
  const doc: GoalDoc = {
    id: ref.id,
    attendantId: hasAttendant ? attendantId : null,
    departmentId: hasDepartment ? departmentId : null,
    period,
    target,
    metric,
    createdAt: now,
    updatedAt: now,
  }

  await ref.set(doc)
  await appendAuditLog({
    userId: req.authUser!.uid,
    action: 'goals.create',
    entity: 'goals',
    entityId: doc.id,
    before: null,
    after: doc,
  })
  res.status(201).json(doc)
})

goalsRouter.put('/goals/:id', requireRole('ADMIN'), async (req, res) => {
  const { id } = req.params
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'id inválido' })
    return
  }

  const existing = await collections.goals.doc(id).get()
  if (!existing.exists) {
    res.status(404).json({ error: 'Meta não encontrada' })
    return
  }

  const { target, period, metric } = req.body ?? {}
  const before = existing.data()!
  const doc: GoalDoc = {
    ...before,
    target: typeof target === 'number' && target > 0 ? target : before.target,
    period: parsePeriod(period) ? period : before.period,
    metric: VALID_METRICS.includes(metric) ? metric : before.metric,
    updatedAt: new Date().toISOString(),
  }

  await collections.goals.doc(id).set(doc)
  await appendAuditLog({
    userId: req.authUser!.uid,
    action: 'goals.update',
    entity: 'goals',
    entityId: id,
    before,
    after: doc,
  })
  res.json(doc)
})
