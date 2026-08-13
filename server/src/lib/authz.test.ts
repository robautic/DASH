import { describe, expect, it, vi } from 'vitest'
import { canReadConversation, canReadConversion, canReadLead, scopeConversionsQuery, scopeLeadsQuery } from './authz.js'
import type { AuthUser } from '../middleware/auth.js'

function user(overrides: Partial<AuthUser>): AuthUser {
  return { uid: 'u1', email: 'u1@test.com', role: 'ATTENDANT', departmentIds: [], attendantId: null, ...overrides }
}

describe('canReadLead', () => {
  it('ADMIN lê qualquer lead', () => {
    expect(canReadLead(user({ role: 'ADMIN' }), { departmentId: 'x', attendantId: 'y' })).toBe(true)
  })

  it('VIEWER lê qualquer lead', () => {
    expect(canReadLead(user({ role: 'VIEWER' }), { departmentId: 'x', attendantId: 'y' })).toBe(true)
  })

  it('SUPERVISOR só lê leads do próprio departamento', () => {
    const supervisor = user({ role: 'SUPERVISOR', departmentIds: ['dep-next'] })
    expect(canReadLead(supervisor, { departmentId: 'dep-next', attendantId: 'a1' })).toBe(true)
    expect(canReadLead(supervisor, { departmentId: 'dep-value', attendantId: 'a1' })).toBe(false)
    expect(canReadLead(supervisor, { departmentId: null, attendantId: 'a1' })).toBe(false)
  })

  it('ATTENDANT só lê os próprios leads — nunca por nome, sempre por attendantId', () => {
    const attendant = user({ role: 'ATTENDANT', attendantId: 'a1' })
    expect(canReadLead(attendant, { departmentId: 'dep-next', attendantId: 'a1' })).toBe(true)
    expect(canReadLead(attendant, { departmentId: 'dep-next', attendantId: 'a2' })).toBe(false)
    expect(canReadLead(attendant, { departmentId: 'dep-next', attendantId: null })).toBe(false)
  })

  it('role desconhecido nunca tem acesso (fail-closed)', () => {
    // @ts-expect-error testando um role inválido de propósito
    expect(canReadLead(user({ role: 'HACKER' }), { departmentId: 'x', attendantId: 'y' })).toBe(false)
  })
})

describe('canReadConversation', () => {
  it('ATTENDANT só lê conversas em que ele está entre os attendantIds', () => {
    const attendant = user({ role: 'ATTENDANT', attendantId: 'a1' })
    expect(canReadConversation(attendant, { departmentId: 'd1', attendantIds: ['a1', 'a2'] })).toBe(true)
    expect(canReadConversation(attendant, { departmentId: 'd1', attendantIds: ['a2', 'a3'] })).toBe(false)
  })

  it('SUPERVISOR sem departamento nenhum não lê nada', () => {
    const supervisor = user({ role: 'SUPERVISOR', departmentIds: [] })
    expect(canReadConversation(supervisor, { departmentId: 'd1', attendantIds: ['a1'] })).toBe(false)
  })
})

describe('canReadConversion', () => {
  it('segue a mesma regra de escopo por attendantId/departmentId', () => {
    const attendant = user({ role: 'ATTENDANT', attendantId: 'a1' })
    expect(canReadConversion(attendant, { departmentId: 'd1', attendantId: 'a1' })).toBe(true)
    expect(canReadConversion(attendant, { departmentId: 'd1', attendantId: 'a2' })).toBe(false)
  })
})

// Stub mínimo de uma Query do Firestore — só precisa registrar as chamadas
// a .where(), que é tudo que scopeLeadsQuery/scopeConversionsQuery usam.
function fakeQuery() {
  const calls: Array<{ field: string; op: string; value: unknown }> = []
  const query: any = {
    where: vi.fn((field: string, op: string, value: unknown) => {
      calls.push({ field, op, value })
      return query
    }),
  }
  return { query, calls }
}

describe('scopeLeadsQuery', () => {
  it('ADMIN e VIEWER recebem a query sem filtro nenhum', () => {
    const { query, calls } = fakeQuery()
    expect(scopeLeadsQuery(user({ role: 'ADMIN' }), query)).toBe(query)
    expect(calls).toHaveLength(0)
  })

  it('SUPERVISOR filtra por departmentId "in"', () => {
    const { query, calls } = fakeQuery()
    scopeLeadsQuery(user({ role: 'SUPERVISOR', departmentIds: ['d1', 'd2'] }), query)
    expect(calls).toEqual([{ field: 'departmentId', op: 'in', value: ['d1', 'd2'] }])
  })

  it('SUPERVISOR sem departamento retorna null (lista vazia, nunca "sem filtro")', () => {
    const { query } = fakeQuery()
    expect(scopeLeadsQuery(user({ role: 'SUPERVISOR', departmentIds: [] }), query)).toBeNull()
  })

  it('ATTENDANT filtra por attendantId "=="', () => {
    const { query, calls } = fakeQuery()
    scopeLeadsQuery(user({ role: 'ATTENDANT', attendantId: 'a1' }), query)
    expect(calls).toEqual([{ field: 'attendantId', op: '==', value: 'a1' }])
  })

  it('ATTENDANT sem attendantId vinculado retorna null', () => {
    const { query } = fakeQuery()
    expect(scopeLeadsQuery(user({ role: 'ATTENDANT', attendantId: null }), query)).toBeNull()
  })
})

describe('scopeConversionsQuery', () => {
  it('espelha a mesma lógica de scopeLeadsQuery', () => {
    const { query, calls } = fakeQuery()
    scopeConversionsQuery(user({ role: 'SUPERVISOR', departmentIds: ['d1'] }), query)
    expect(calls).toEqual([{ field: 'departmentId', op: 'in', value: ['d1'] }])
  })
})
