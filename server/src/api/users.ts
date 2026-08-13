// Provisionamento de usuários (users/{uid}: role, departmentIds,
// attendantId). Só ADMIN — é quem decide quem tem acesso ao LeadDash e com
// que permissão. A tela /usuarios (Fase 7) consome estas rotas.
import { Router } from 'express'
import { collections } from '../lib/collections.js'
import { requireRole } from '../middleware/auth.js'
import { appendAuditLog } from '../services/leaddash/auditLog.js'
import type { Role, UserDoc } from '../types/firestore.js'

export const usersRouter = Router()

usersRouter.get('/users', requireRole('ADMIN'), async (_req, res) => {
  const snap = await collections.users.get()
  res.json(snap.docs.map((d) => d.data()))
})

const VALID_ROLES: Role[] = ['ADMIN', 'SUPERVISOR', 'ATTENDANT', 'VIEWER']

usersRouter.put('/users/:uid', requireRole('ADMIN'), async (req, res) => {
  const { uid } = req.params
  if (typeof uid !== 'string') {
    res.status(400).json({ error: 'uid inválido' })
    return
  }
  const { email, role, departmentIds, attendantId } = req.body ?? {}

  if (typeof email !== 'string' || !email) {
    res.status(400).json({ error: 'email é obrigatório' })
    return
  }
  if (!VALID_ROLES.includes(role)) {
    res.status(400).json({ error: `role deve ser um de: ${VALID_ROLES.join(', ')}` })
    return
  }

  const now = new Date().toISOString()
  const existing = await collections.users.doc(uid).get()
  const before = existing.exists ? existing.data()! : null

  const doc: UserDoc = {
    id: uid,
    email,
    role,
    departmentIds: Array.isArray(departmentIds) ? departmentIds : [],
    attendantId: typeof attendantId === 'string' ? attendantId : null,
    createdAt: before ? before.createdAt : now,
    updatedAt: now,
  }

  await collections.users.doc(uid).set(doc)
  await appendAuditLog({
    userId: req.authUser!.uid,
    action: before ? 'users.update' : 'users.create',
    entity: 'users',
    entityId: uid,
    before,
    after: doc,
  })
  res.status(before ? 200 : 201).json(doc)
})
