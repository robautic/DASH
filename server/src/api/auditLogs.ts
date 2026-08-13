// GET /api/audit-logs — só ADMIN. Lista as últimas ações auditadas
// (usuário, ação, entidade, antes/depois, timestamp).
import { Router } from 'express'
import { collections } from '../lib/collections.js'
import { requireRole } from '../middleware/auth.js'

export const auditLogsRouter = Router()

auditLogsRouter.get('/audit-logs', requireRole('ADMIN'), async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200)
  const snap = await collections.auditLogs.orderBy('timestamp', 'desc').limit(limit).get()
  res.json(snap.docs.map((d) => d.data()))
})
