// GET /api/dashboard/kpis — contagens reais (leads e conversões) já
// escopadas por role, usando count() nativo do Firestore (não baixa os
// documentos pra contar). Métricas mais ricas — tempo médio de resposta,
// SLA, série por dia — dependem dos agregados de `metrics/`, calculados na
// Fase 7; até lá este endpoint só expõe o que já é real e verificável.
import { Router } from 'express'
import { getScopedTotals } from '../services/leaddash/performance.js'

export const dashboardRouter = Router()

dashboardRouter.get('/dashboard/kpis', async (req, res) => {
  const totals = await getScopedTotals(req.authUser!)
  res.json(totals)
})
