// Rotas de dados de referência: atendentes, departamentos, campanhas,
// pipelines/stages, tags. Sem regra de negócio complexa — a coleção já é
// filtrada por escopo simples quando faz sentido (departamentos do
// SUPERVISOR); o resto é leitura aberta pra qualquer usuário autenticado,
// igual às Firestore Rules definidas na Fase 3.
import { Router } from 'express'
import { collections } from '../lib/collections.js'
import { listCampaignsPerformance } from '../services/leaddash/performance.js'

export const referenceDataRouter = Router()

referenceDataRouter.get('/attendants', async (_req, res) => {
  const snap = await collections.attendants.get()
  res.json(snap.docs.map((d) => d.data()))
})

referenceDataRouter.get('/departments', async (req, res) => {
  const user = req.authUser!
  let query: FirebaseFirestore.Query = collections.departments
  if (user.role === 'SUPERVISOR') {
    if (user.departmentIds.length === 0) {
      res.json([])
      return
    }
    query = query.where('__name__', 'in', user.departmentIds.slice(0, 30))
  }
  const snap = await query.get()
  res.json(snap.docs.map((d) => d.data()))
})

referenceDataRouter.get('/campaigns', async (req, res) => {
  const user = req.authUser!
  if (user.role === 'ATTENDANT') {
    res.status(403).json({ error: 'Sem permissão para ver campanhas' })
    return
  }
  // A coleção `campaigns` do Firestore ainda não tem nenhum processo que
  // escreva nela (ver types/firestore.ts) — investimento/CPA/receita/ROI
  // exigem uma fonte de dado que o LeadDash não tem hoje. Por isso a lista
  // é computada on-demand a partir de leads/conversions reais, e o
  // frontend mostra "Dados indisponíveis" pras métricas financeiras.
  const list = await listCampaignsPerformance(user)
  res.json(list)
})

referenceDataRouter.get('/pipelines', async (_req, res) => {
  const snap = await collections.pipelines.get()
  res.json(snap.docs.map((d) => d.data()))
})

referenceDataRouter.get('/pipelines/:id/stages', async (req, res) => {
  const snap = await collections.stages.where('pipelineId', '==', req.params.id).orderBy('index').get()
  res.json(snap.docs.map((d) => d.data()))
})

referenceDataRouter.get('/tags', async (_req, res) => {
  const snap = await collections.tags.get()
  res.json(snap.docs.map((d) => d.data()))
})

// Resumo do estado de sincronização — só o essencial (não o erro completo,
// que fica restrito a ADMIN via a coleção syncState nas Firestore Rules).
// Existe pra UI poder mostrar "Última sincronização: X minutos atrás" pra
// qualquer usuário logado, conforme exigido no tratamento de erro do spec.
referenceDataRouter.get('/sync-status', async (_req, res) => {
  const snap = await collections.syncState.doc('datacrazy').get()
  if (!snap.exists) {
    res.json({ lastSuccessfulSync: null, status: null })
    return
  }
  const data = snap.data()!
  res.json({ lastSuccessfulSync: data.lastSuccessfulSync, status: data.status })
})
