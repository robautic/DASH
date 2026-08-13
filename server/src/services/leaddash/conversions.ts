// Registro de conversão — cria o doc em `conversions` (coleção própria,
// separada de leadHistory) quando um lead converte. O evento
// `lead.converted` do DataCrazy não traz valor monetário, então `value`
// fica null até existir uma fonte real pra esse dado (ex.: integração com
// negócios/produtos — fora do escopo das Fases 1-3).
import { collections } from '../../lib/collections.js'
import type { ConversionDoc } from '../../types/firestore.js'

export async function recordConversion(entry: {
  leadId: string
  attendantId: string | null
  departmentId: string | null
  campaignId: string | null
}) {
  const doc: ConversionDoc = {
    id: entry.leadId, // um lead converte uma vez só nesse modelo simples — 1 doc por lead
    leadId: entry.leadId,
    attendantId: entry.attendantId,
    departmentId: entry.departmentId,
    campaignId: entry.campaignId,
    value: null,
    status: 'CONVERTED',
    convertedAt: new Date().toISOString(),
  }
  await collections.conversions.doc(doc.id).set(doc, { merge: true })
}
