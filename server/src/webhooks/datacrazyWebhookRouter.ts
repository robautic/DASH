// Rota que recebe os eventos disparados pelas automações do DataCrazy
// (lead.created/updated/assigned, conversation.created/updated,
// message.created, lead.converted) e atualiza o Firestore. É o mecanismo
// principal de atualização em tempo real — ver nota em
// services/datacrazy/leads.ts sobre por que o polling sozinho não é suficiente.
//
// Autenticação: o DataCrazy não assina o payload nativamente, então o
// segredo é combinado manualmente — a automação do DataCrazy deve enviar o
// header `x-webhook-secret` com o valor de DATACRAZY_WEBHOOK_SECRET.
//
// Estratégia geral: o payload de webhook do DataCrazy costuma vir "raso"
// (só IDs). Pra não gravar dado parcial/inventado, sempre que possível a
// gente busca o recurso completo via GET (getLeadById/getConversationById)
// e grava o mapeamento oficial — o payload cru só serve pra saber "o que"
// mudou e "qual ID".
import { Router } from 'express'
import { env } from '../config/env.js'
import { collections } from '../lib/collections.js'
import { childLogger } from '../lib/logger.js'
import {
  getConversationById,
  getLeadById,
  parseWebhookEvent,
  toFirestoreConversation,
  toFirestoreLead,
  toFirestoreMessage,
} from '../services/datacrazy/index.js'
import type { DataCrazyMessageWebhookPayload } from '../services/datacrazy/messages.js'
import { appendLeadHistory } from '../services/leaddash/leadHistory.js'
import { recordConversion } from '../services/leaddash/conversions.js'

export const datacrazyWebhookRouter = Router()
const log = childLogger('datacrazyWebhook')

datacrazyWebhookRouter.post('/datacrazy', async (req, res) => {
  if (env.datacrazy.webhookSecret) {
    const provided = req.header('x-webhook-secret')
    if (provided !== env.datacrazy.webhookSecret) {
      res.status(401).json({ error: 'x-webhook-secret inválido ou ausente' })
      return
    }
  }

  let event
  try {
    event = parseWebhookEvent(req.body)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Payload inválido' })
    return
  }

  try {
    await handleEvent(event)
    res.status(200).json({ received: true, type: event.type })
  } catch (err) {
    // Loga mas responde 200 pra não fazer o DataCrazy re-tentar em loop um
    // payload que provavelmente vai falhar de novo. Falha real fica visível
    // em auditLogs/monitoramento (Fase 7).
    log.error({ err, eventType: event.type }, 'Erro processando webhook do Datacrazy')
    res.status(200).json({ received: true, type: event.type, processed: false })
  }
})

async function handleEvent(event: ReturnType<typeof parseWebhookEvent>) {
  switch (event.type) {
    case 'lead.assigned': {
      const data = event.data as { leadId?: string; attendantId?: string }
      if (!data.leadId || !data.attendantId) throw new Error('lead.assigned sem leadId/attendantId')
      const previous = await collections.leads.doc(data.leadId).get()
      await collections.leads
        .doc(data.leadId)
        .set({ attendantId: data.attendantId, updatedAt: event.receivedAt }, { merge: true })
      await appendLeadHistory({
        leadId: data.leadId,
        type: 'ASSIGNED',
        from: previous.data()?.attendantId ?? null,
        to: data.attendantId,
        performedBy: 'datacrazy-webhook',
      })
      break
    }

    case 'lead.converted': {
      const data = event.data as { leadId?: string }
      if (!data.leadId) throw new Error('lead.converted sem leadId')
      const leadSnap = await collections.leads.doc(data.leadId).get()
      const lead = leadSnap.data()
      await collections.leads.doc(data.leadId).set(
        { conversionStatus: 'CONVERTED', convertedAt: event.receivedAt, updatedAt: event.receivedAt },
        { merge: true },
      )
      await appendLeadHistory({ leadId: data.leadId, type: 'CONVERTED', performedBy: 'datacrazy-webhook' })
      await recordConversion({
        leadId: data.leadId,
        attendantId: lead?.attendantId ?? null,
        departmentId: lead?.departmentId ?? null,
        campaignId: lead?.campaignId ?? null,
      })
      break
    }

    case 'lead.created':
    case 'lead.updated': {
      const data = event.data as { id?: string; leadId?: string }
      const leadId = data.id ?? data.leadId
      if (!leadId) throw new Error(`${event.type} sem id de lead`)
      // Busca o lead completo em vez de confiar no payload raso do webhook —
      // GET /leads/{id} é a fonte da verdade (ver services/datacrazy/leads.ts).
      const fullLead = await getLeadById(leadId)
      await collections.leads.doc(leadId).set(
        { ...toFirestoreLead(fullLead), updatedAt: event.receivedAt },
        { merge: true },
      )
      break
    }

    case 'conversation.created':
    case 'conversation.updated': {
      const data = event.data as { id?: string; leadId?: string }
      if (!data.id) throw new Error(`${event.type} sem id de conversa`)
      const fullConversation = await getConversationById(data.id)
      const conversationDoc = toFirestoreConversation(fullConversation, data.leadId ?? null)
      await collections.conversations.doc(data.id).set(conversationDoc, { merge: true })

      // Departamento não tem endpoint próprio (ver services/datacrazy/departments.ts)
      // — a conversa é a única fonte, então aproveitamos pra manter a coleção em dia.
      if (fullConversation.currentDepartment) {
        const dept = fullConversation.currentDepartment
        await collections.departments.doc(dept.id).set(
          {
            id: dept.id,
            name: dept.name,
            color: dept.color ?? null,
            main: dept.main,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
            syncedAt: event.receivedAt,
          },
          { merge: true },
        )
      }

      // Se a conversa está ligada a um lead, propaga o departamento pra ele
      // também — é o único jeito de leads/leads/:id mostrar departamento.
      if (data.leadId && conversationDoc.departmentId) {
        await collections.leads
          .doc(data.leadId)
          .set({ departmentId: conversationDoc.departmentId, updatedAt: event.receivedAt }, { merge: true })
      }
      break
    }

    case 'message.created': {
      const data = event.data as DataCrazyMessageWebhookPayload
      if (!data.id) throw new Error('message.created sem id')
      await collections.messages.doc(data.id).set(toFirestoreMessage(data), { merge: true })
      if (data.leadId) {
        await collections.leads
          .doc(data.leadId)
          .set({ lastInteractionAt: data.createdAt }, { merge: true })
      }
      break
    }
  }
}
