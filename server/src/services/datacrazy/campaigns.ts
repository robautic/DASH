// A API do DataCrazy não tem um conceito nativo de "campanha" — o que existe
// é `source` e `sourceReferral` (sourceId/sourceUrl/ctwaId) no lead. Este
// módulo não chama a API: ele deriva uma chave de campanha a partir desses
// campos, usada para agrupar leads na coleção `campaigns` do Firestore.
// Métricas (leads, conversions, conversionRate, cpa, roi) são calculadas em
// cima dessa chave nas Fases 3/7 (agregação), não aqui.
import type { DataCrazyLead } from './leads.js'

export function deriveCampaignKey(lead: Pick<DataCrazyLead, 'source' | 'sourceReferral'>): string | null {
  if (lead.sourceReferral?.sourceId) return lead.sourceReferral.sourceId
  if (lead.source) return lead.source
  return null
}
