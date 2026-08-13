// Registro de auditoria — quem fez o quê, quando, e o antes/depois. Chamado
// pelas rotas que alteram dado sensível (hoje: PUT /api/users/:uid e
// POST/PUT /api/goals). Nunca falha a operação principal se o log falhar —
// perder uma escrita de auditoria não pode derrubar a ação do usuário.
import { collections } from '../../lib/collections.js'
import type { AuditLogDoc } from '../../types/firestore.js'
import { childLogger } from '../../lib/logger.js'

const log = childLogger('auditLog')

export async function appendAuditLog(entry: {
  userId: string
  action: string
  entity: string
  entityId: string
  before: unknown
  after: unknown
}) {
  const doc: AuditLogDoc = {
    userId: entry.userId,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    before: entry.before ?? null,
    after: entry.after ?? null,
    timestamp: new Date().toISOString(),
  }
  try {
    await collections.auditLogs.add(doc)
  } catch (err) {
    log.error({ err, entry }, 'Falha ao gravar auditLog (ação principal não foi afetada)')
  }
}
