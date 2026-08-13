// Performance de atendentes (Fase 6) — ranking dentro do escopo do usuário
// e detalhe de um atendente específico. Ver services/leaddash/performance.ts
// pra nota sobre o que é real vs. o que ainda não dá pra calcular.
import { Router } from 'express'
import { getAttendantPerformance, listAttendantsPerformance } from '../services/leaddash/performance.js'

export const attendantsPerformanceRouter = Router()

attendantsPerformanceRouter.get('/attendants/performance', async (req, res) => {
  const list = await listAttendantsPerformance(req.authUser!)
  res.json(list)
})

attendantsPerformanceRouter.get('/attendants/:id/performance', async (req, res) => {
  const user = req.authUser!
  const { id } = req.params
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'id inválido' })
    return
  }

  // ATTENDANT só vê a própria performance. Os outros roles (ADMIN/VIEWER/
  // SUPERVISOR) podem ver qualquer atendente — não existe hoje um vínculo
  // direto attendantId -> departmentId no DataCrazy pra restringir o
  // SUPERVISOR com precisão (ver services/datacrazy/agents.ts), então essa
  // é uma decisão pragmática documentada, não um descuido.
  if (user.role === 'ATTENDANT' && user.attendantId !== id) {
    res.status(403).json({ error: 'Sem permissão para ver a performance de outro atendente' })
    return
  }

  const performance = await getAttendantPerformance(id)
  if (!performance) {
    res.status(404).json({ error: 'Atendente não encontrado' })
    return
  }
  res.json(performance)
})
