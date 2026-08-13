// GET /api/conversions/funnel — funil Leads -> Atendidos -> Qualificados ->
// Oportunidades -> Conversões. Qualificados/Oportunidades ficam null de
// propósito (ver services/leaddash/performance.ts).
import { Router } from 'express'
import { getConversionFunnel } from '../services/leaddash/performance.js'

export const conversionsRouter = Router()

conversionsRouter.get('/conversions/funnel', async (req, res) => {
  const funnel = await getConversionFunnel(req.authUser!)
  res.json(funnel)
})
