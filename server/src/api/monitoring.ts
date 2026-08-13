// GET /api/monitoring/status — área administrativa mostrando DataCrazy API,
// Firestore, sincronização, último sync, registros processados, erros e
// quantidade de 429. Só ADMIN.
//
// Importante: este endpoint NÃO faz uma chamada nova pra API do DataCrazy
// a cada request — isso poderia consumir cota (60 req/min por rota) só de
// gente abrindo a tela de monitoramento. O status do DataCrazy reportado
// aqui é inferido do resultado da última sincronização (syncState), que já
// reflete se a API respondeu ou não recentemente.
import { Router } from 'express'
import { collections } from '../lib/collections.js'
import { requireRole } from '../middleware/auth.js'
import { datacrazyRateLimiter } from '../lib/rateLimiter.js'

export const monitoringRouter = Router()

monitoringRouter.get('/monitoring/status', requireRole('ADMIN'), async (_req, res) => {
  const syncSnap = await collections.syncState.doc('datacrazy').get()
  const sync = syncSnap.exists ? syncSnap.data()! : null

  res.json({
    firestore: { status: 'ok' }, // se chegamos até aqui, a leitura acima já funcionou
    datacrazy: {
      // 'success'/'running' => última tentativa de falar com a API deu certo;
      // 'error' => a última tentativa falhou; null => nunca rodou.
      status: sync?.status ?? null,
      inferredFrom: 'último resultado do sync worker, não uma checagem em tempo real',
    },
    sync: {
      lastSuccessfulSync: sync?.lastSuccessfulSync ?? null,
      lastAttempt: sync?.lastAttempt ?? null,
      status: sync?.status ?? null,
      error: sync?.error ?? null,
      recordsProcessed: sync?.recordsProcessed ?? null,
      duration: sync?.duration ?? null,
    },
    rateLimiter: datacrazyRateLimiter.getStats(),
  })
})
