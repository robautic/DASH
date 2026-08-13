// GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD — leads/conversões
// reais no período, já escopados por role (mesma lógica de authz do resto
// da API). Relatórios mais elaborados (por atendente/campanha dentro do
// período) reaproveitam os mesmos filtros — ver TODO no final do arquivo.
import { Router } from 'express'
import { scopeConversionsQuery, scopeLeadsQuery } from '../lib/authz.js'
import { collections } from '../lib/collections.js'

export const reportsRouter = Router()

reportsRouter.get('/reports/summary', async (req, res) => {
  const user = req.authUser!
  const { from, to } = req.query

  if (typeof from !== 'string' || typeof to !== 'string' || !from || !to) {
    res.status(400).json({ error: 'parâmetros from e to (YYYY-MM-DD) são obrigatórios' })
    return
  }

  const scopedLeads = scopeLeadsQuery(user, collections.leads)
  const scopedConversions = scopeConversionsQuery(user, collections.conversions)

  const leadsCount = scopedLeads
    ? (await scopedLeads.where('createdAt', '>=', from).where('createdAt', '<=', `${to}T23:59:59.999Z`).count().get()).data()
        .count
    : 0

  const conversionsCount = scopedConversions
    ? (
        await scopedConversions
          .where('convertedAt', '>=', from)
          .where('convertedAt', '<=', `${to}T23:59:59.999Z`)
          .count()
          .get()
      ).data().count
    : 0

  res.json({
    from,
    to,
    leads: leadsCount,
    conversions: conversionsCount,
    conversionRate: leadsCount > 0 ? conversionsCount / leadsCount : null,
  })
})

// TODO(futuro): quebrar esse resumo por atendente/campanha dentro do
// período pedido reaproveitando services/leaddash/performance.ts com um
// filtro de data adicional — hoje o resumo é só o total, que já é o que a
// tela de Relatórios da Fase 7 precisa.
