// GET /api/leads (lista, já escopada por role + filtros) e
// GET /api/leads/:id (detalhe + histórico). Paginação simples por
// skip/limit — Firestore não pagina por offset com eficiência em bases
// grandes, mas resolve bem o volume esperado aqui; se a base crescer muito,
// trocar por cursor (startAfter) fica documentado como próximo passo.
import { Router } from 'express'
import { collections } from '../lib/collections.js'
import { canReadLead, scopeLeadsQuery } from '../lib/authz.js'

export const leadsRouter = Router()

leadsRouter.get('/leads', async (req, res) => {
  const user = req.authUser!
  const scoped = scopeLeadsQuery(user, collections.leads)
  if (!scoped) {
    res.json({ count: 0, data: [] })
    return
  }

  let query: FirebaseFirestore.Query = scoped

  const { attendantId, departmentId, campaignId, source, status, pipelineId, tag, limit, skip } = req.query
  if (typeof attendantId === 'string') query = query.where('attendantId', '==', attendantId)
  if (typeof departmentId === 'string') query = query.where('departmentId', '==', departmentId)
  if (typeof campaignId === 'string') query = query.where('campaignId', '==', campaignId)
  if (typeof source === 'string') query = query.where('source', '==', source)
  if (typeof status === 'string') query = query.where('status', '==', status)
  if (typeof pipelineId === 'string') query = query.where('pipelineId', '==', pipelineId)
  if (typeof tag === 'string') query = query.where('tags', 'array-contains', tag)

  query = query.orderBy('createdAt', 'desc')

  const take = Math.min(Number(limit) || 50, 200)
  const offset = Number(skip) || 0

  const snap = await query.offset(offset).limit(take).get()
  res.json({ count: snap.size, data: snap.docs.map((d) => d.data()) })
})

leadsRouter.get('/leads/:id', async (req, res) => {
  const user = req.authUser!
  const snap = await collections.leads.doc(req.params.id).get()

  if (!snap.exists) {
    res.status(404).json({ error: 'Lead não encontrado' })
    return
  }

  const lead = snap.data()!
  if (!canReadLead(user, lead)) {
    res.status(403).json({ error: 'Sem permissão para ver este lead' })
    return
  }

  const historySnap = await collections.leadHistory
    .where('leadId', '==', lead.id)
    .orderBy('createdAt', 'desc')
    .get()

  res.json({ lead, history: historySnap.docs.map((d) => d.data()) })
})
