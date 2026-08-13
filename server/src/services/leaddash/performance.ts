// Cálculos de performance usados pelas telas de Atendentes/Supervisores
// (Fase 6). Tudo aqui é contagem real via Firestore — nada de número
// inventado. Tempo médio de resposta/atendimento e SLA dependem de
// timestamps que a API do DataCrazy não entrega pro nosso mapeamento atual
// (ver services/datacrazy/leads.ts) — por isso não aparecem aqui; a rota
// devolve só o que dá pra calcular honestamente, e o frontend mostra "Dados
// indisponíveis" pro resto.
//
// Nota de escala: isso soma contagens por atendente lendo só o campo
// `attendantId`/`campaignId` das queries escopadas (`.select()`, não o
// documento inteiro) — funciona bem até a base crescer bastante. A Fase 7
// substitui isso por agregados pré-computados em `metrics/`, exatamente pra
// não fazer essa varredura toda hora.
import { collections } from '../../lib/collections.js'
import { scopeConversionsQuery, scopeLeadsQuery } from '../../lib/authz.js'
import type { AuthUser } from '../../middleware/auth.js'

export interface ScopedTotals {
  leads: number
  conversions: number
  conversionRate: number | null
}

export async function getScopedTotals(user: AuthUser): Promise<ScopedTotals> {
  const scopedLeads = scopeLeadsQuery(user, collections.leads)
  const leads = scopedLeads ? (await scopedLeads.count().get()).data().count : 0

  const scopedConversions = scopeConversionsQuery(user, collections.conversions)
  const conversions = scopedConversions ? (await scopedConversions.count().get()).data().count : 0

  return { leads, conversions, conversionRate: leads > 0 ? conversions / leads : null }
}

function tally(counts: Map<string, number>, key: string | null) {
  if (!key) return
  counts.set(key, (counts.get(key) ?? 0) + 1)
}

export interface AttendantPerformance {
  attendantId: string
  name: string
  leads: number
  conversions: number
  conversionRate: number | null
}

/** Ranking de atendentes dentro do escopo do usuário (ADMIN/VIEWER = todos; SUPERVISOR = só quem apareceu nos leads do próprio departamento). */
export async function listAttendantsPerformance(user: AuthUser): Promise<AttendantPerformance[]> {
  const scopedLeads = scopeLeadsQuery(user, collections.leads)
  const scopedConversions = scopeConversionsQuery(user, collections.conversions)
  if (!scopedLeads || !scopedConversions) return []

  const [leadsSnap, conversionsSnap, attendantsSnap] = await Promise.all([
    scopedLeads.select('attendantId').get(),
    scopedConversions.select('attendantId').get(),
    collections.attendants.get(),
  ])

  const leadCounts = new Map<string, number>()
  for (const doc of leadsSnap.docs) tally(leadCounts, (doc.data() as { attendantId: string | null }).attendantId)

  const conversionCounts = new Map<string, number>()
  for (const doc of conversionsSnap.docs) {
    tally(conversionCounts, (doc.data() as { attendantId: string | null }).attendantId)
  }

  const attendantNames = new Map(attendantsSnap.docs.map((d) => [d.id, d.data().name]))
  const relevantIds =
    user.role === 'ADMIN' || user.role === 'VIEWER'
      ? new Set(attendantsSnap.docs.map((d) => d.id))
      : new Set([...leadCounts.keys(), ...conversionCounts.keys()])

  return [...relevantIds]
    .map((attendantId) => {
      const leads = leadCounts.get(attendantId) ?? 0
      const conversions = conversionCounts.get(attendantId) ?? 0
      return {
        attendantId,
        name: attendantNames.get(attendantId) ?? attendantId,
        leads,
        conversions,
        conversionRate: leads > 0 ? conversions / leads : null,
      }
    })
    .sort((a, b) => b.leads - a.leads)
}

export async function getAttendantPerformance(attendantId: string): Promise<AttendantPerformance | null> {
  const [leadsCount, conversionsCount, attendantSnap] = await Promise.all([
    collections.leads.where('attendantId', '==', attendantId).count().get(),
    collections.conversions.where('attendantId', '==', attendantId).count().get(),
    collections.attendants.doc(attendantId).get(),
  ])
  if (!attendantSnap.exists) return null

  const leads = leadsCount.data().count
  const conversions = conversionsCount.data().count
  return {
    attendantId,
    name: attendantSnap.data()!.name,
    leads,
    conversions,
    conversionRate: leads > 0 ? conversions / leads : null,
  }
}

export interface CampaignPerformance {
  campaignId: string
  leads: number
  conversions: number
  conversionRate: number | null
}

/** Agregação on-demand por campanha — não existe uma coleção `campaigns` mantida ainda (ninguém escreve nela hoje), então isso computa direto de leads/conversions. */
export async function listCampaignsPerformance(user: AuthUser): Promise<CampaignPerformance[]> {
  const scopedLeads = scopeLeadsQuery(user, collections.leads)
  const scopedConversions = scopeConversionsQuery(user, collections.conversions)
  if (!scopedLeads || !scopedConversions) return []

  const [leadsSnap, conversionsSnap] = await Promise.all([
    scopedLeads.select('campaignId').get(),
    scopedConversions.select('campaignId').get(),
  ])

  const leadCounts = new Map<string, number>()
  for (const doc of leadsSnap.docs) tally(leadCounts, (doc.data() as { campaignId: string | null }).campaignId)

  const conversionCounts = new Map<string, number>()
  for (const doc of conversionsSnap.docs) {
    tally(conversionCounts, (doc.data() as { campaignId: string | null }).campaignId)
  }

  return [...leadCounts.keys()]
    .map((campaignId) => {
      const leads = leadCounts.get(campaignId) ?? 0
      const conversions = conversionCounts.get(campaignId) ?? 0
      return { campaignId, leads, conversions, conversionRate: leads > 0 ? conversions / leads : null }
    })
    .sort((a, b) => b.leads - a.leads)
}

export interface ConversionFunnel {
  leads: number
  atendidos: number
  qualificados: null
  oportunidades: null
  conversoes: number
}

/**
 * Qualificados/Oportunidades dependem de como cada tenant do DataCrazy
 * configura pipeline/stage — não tem mapeamento genérico sem inventar
 * critério, então ficam null de propósito (ver ConversoesPage no frontend).
 */
export async function getConversionFunnel(user: AuthUser): Promise<ConversionFunnel> {
  const scopedLeads = scopeLeadsQuery(user, collections.leads)
  if (!scopedLeads) return { leads: 0, atendidos: 0, qualificados: null, oportunidades: null, conversoes: 0 }

  const [leadsCount, atendidosCount, conversions] = await Promise.all([
    scopedLeads.count().get(),
    scopedLeads.where('attendantId', '!=', null).count().get(),
    scopeConversionsQuery(user, collections.conversions),
  ])

  const conversoes = conversions ? (await conversions.count().get()).data().count : 0

  return {
    leads: leadsCount.data().count,
    atendidos: atendidosCount.data().count,
    qualificados: null,
    oportunidades: null,
    conversoes,
  }
}
