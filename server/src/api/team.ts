// GET /api/team/overview — usado pela tela do Supervisor: totais do
// departamento autorizado + ranking dos atendentes dentro dele. Pra
// ADMIN/VIEWER, o "escopo" é a base inteira.
import { Router } from 'express'
import { getScopedTotals, listAttendantsPerformance } from '../services/leaddash/performance.js'

export const teamRouter = Router()

teamRouter.get('/team/overview', async (req, res) => {
  const user = req.authUser!
  const [totals, ranking] = await Promise.all([getScopedTotals(user), listAttendantsPerformance(user)])
  res.json({ ...totals, attendants: ranking })
})
