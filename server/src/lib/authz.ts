// Regras de autorização usadas pelas rotas de server/api/ — espelham
// deliberadamente a lógica de firebase/firestore.rules (mesma fonte de
// verdade em dois lugares: backend valida antes de qualquer query cara,
// Firestore Rules validam de novo como defesa em profundidade). Se uma
// mudar, a outra tem que mudar junto.
import type { AuthUser } from '../middleware/auth.js'
import type { LeadDoc, ConversationDoc, ConversionDoc } from '../types/firestore.js'

export function canReadLead(user: AuthUser, lead: Pick<LeadDoc, 'departmentId' | 'attendantId'>): boolean {
  if (user.role === 'ADMIN' || user.role === 'VIEWER') return true
  if (user.role === 'SUPERVISOR') return lead.departmentId != null && user.departmentIds.includes(lead.departmentId)
  if (user.role === 'ATTENDANT') return lead.attendantId != null && lead.attendantId === user.attendantId
  return false
}

export function canReadConversation(
  user: AuthUser,
  conversation: Pick<ConversationDoc, 'departmentId' | 'attendantIds'>,
): boolean {
  if (user.role === 'ADMIN' || user.role === 'VIEWER') return true
  if (user.role === 'SUPERVISOR') {
    return conversation.departmentId != null && user.departmentIds.includes(conversation.departmentId)
  }
  if (user.role === 'ATTENDANT') {
    return user.attendantId != null && conversation.attendantIds.includes(user.attendantId)
  }
  return false
}

export function canReadConversion(user: AuthUser, conversion: Pick<ConversionDoc, 'departmentId' | 'attendantId'>): boolean {
  if (user.role === 'ADMIN' || user.role === 'VIEWER') return true
  if (user.role === 'SUPERVISOR') {
    return conversion.departmentId != null && user.departmentIds.includes(conversion.departmentId)
  }
  if (user.role === 'ATTENDANT') return conversion.attendantId != null && conversion.attendantId === user.attendantId
  return false
}

/**
 * Mesma ideia de scopeLeadsQuery, mas pra `conversions` — usado tanto no
 * dashboard quanto nos endpoints de performance de atendente/equipe.
 */
export function scopeConversionsQuery<Q extends FirebaseFirestore.Query<ConversionDoc>>(
  user: AuthUser,
  query: Q,
): Q | FirebaseFirestore.Query<ConversionDoc> | null {
  switch (user.role) {
    case 'ADMIN':
    case 'VIEWER':
      return query
    case 'SUPERVISOR':
      if (user.departmentIds.length === 0) return null
      return query.where('departmentId', 'in', user.departmentIds.slice(0, 30))
    case 'ATTENDANT':
      if (!user.attendantId) return null
      return query.where('attendantId', '==', user.attendantId)
    default:
      return null
  }
}

/**
 * Aplica o escopo de visibilidade de leads de um usuário a uma query do
 * Firestore. Retorna null quando o role não tem nenhum escopo possível de
 * aplicar via query simples (ex.: SUPERVISOR sem departamento nenhum) — a
 * rota deve tratar null como "lista vazia", nunca como "sem filtro".
 */
export function scopeLeadsQuery<Q extends FirebaseFirestore.Query<LeadDoc>>(
  user: AuthUser,
  query: Q,
): Q | FirebaseFirestore.Query<LeadDoc> | null {
  switch (user.role) {
    case 'ADMIN':
    case 'VIEWER':
      return query
    case 'SUPERVISOR':
      if (user.departmentIds.length === 0) return null
      // Firestore só permite "in" com até 30 valores — suficiente pro nosso caso de uso.
      return query.where('departmentId', 'in', user.departmentIds.slice(0, 30))
    case 'ATTENDANT':
      if (!user.attendantId) return null
      return query.where('attendantId', '==', user.attendantId)
    default:
      return null
  }
}
