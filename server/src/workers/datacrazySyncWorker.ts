// Worker de sincronização DataCrazy -> Firestore.
//
// Leads: na primeira execução importa a base inteira, paginando (ver
// paginateAll em services/datacrazy/client.ts). Nas seguintes, busca só
// leads criados depois do último sync bem sucedido (createdAtGreaterOrEqual)
// — NUNCA rebaixa a base inteira de novo.
//
// Atendentes/pipelines/tags: dados de referência, poucas dezenas de
// registros, sem paginação na API — resincronizados por completo a cada
// rodada (é barato e sempre precisa estar atualizado pros relacionamentos
// attendantId/pipelineId/tags fazerem sentido na UI).
//
// Importante: a API do DataCrazy não tem filtro de "alterado desde X" para
// leads (ver nota em services/datacrazy/leads.ts), então este worker cobre
// só leads NOVOS. Mudanças em leads/conversas já existentes (reatribuição,
// conversão, nova mensagem) chegam pelo webhook em tempo real — os dois
// mecanismos são complementares, não redundantes.
import { collections } from '../lib/collections.js'
import {
  getAttendants,
  getPipelines,
  getPipelineStages,
  getTags,
  iterateLeadsCreatedSince,
  toFirestoreAttendant,
  toFirestoreLead,
  toFirestorePipeline,
  toFirestoreStage,
  toFirestoreTag,
} from '../services/datacrazy/index.js'
import type { SyncStateDoc } from '../types/firestore.js'

async function readSyncState(): Promise<SyncStateDoc | null> {
  const snap = await collections.syncState.doc('datacrazy').get()
  return snap.exists ? snap.data()! : null
}

async function writeSyncState(patch: Partial<SyncStateDoc>) {
  await collections.syncState.doc('datacrazy').set(patch as SyncStateDoc, { merge: true })
}

async function syncLeads(since: string | undefined): Promise<number> {
  let count = 0
  for await (const page of iterateLeadsCreatedSince(since)) {
    const batch = collections.leads.firestore.batch()
    for (const leadDto of page) {
      batch.set(collections.leads.doc(leadDto.id), toFirestoreLead(leadDto), { merge: true })
      count += 1
    }
    await batch.commit()
  }
  return count
}

async function syncAttendants(): Promise<number> {
  const { data } = await getAttendants()
  const batch = collections.attendants.firestore.batch()
  for (const dto of data) batch.set(collections.attendants.doc(dto.id), toFirestoreAttendant(dto), { merge: true })
  await batch.commit()
  return data.length
}

async function syncTags(): Promise<number> {
  const { data } = await getTags()
  const batch = collections.tags.firestore.batch()
  for (const dto of data) batch.set(collections.tags.doc(dto.id), toFirestoreTag(dto), { merge: true })
  await batch.commit()
  return data.length
}

async function syncPipelines(): Promise<number> {
  const { data: pipelines } = await getPipelines()
  let count = 0
  for (const pipeline of pipelines) {
    await collections.pipelines.doc(pipeline.id).set(toFirestorePipeline(pipeline), { merge: true })
    count += 1
    const { data: stages } = await getPipelineStages(pipeline.id)
    const batch = collections.stages.firestore.batch()
    for (const stage of stages) {
      batch.set(collections.stages.doc(stage.id), toFirestoreStage(stage, pipeline.id), { merge: true })
      count += 1
    }
    await batch.commit()
  }
  return count
}

/** Executa uma rodada de sincronização. Sempre registra o resultado em syncState/datacrazy. */
export async function runDatacrazySync(): Promise<SyncStateDoc> {
  const startedAt = Date.now()
  const previous = await readSyncState()
  const since = previous?.lastSuccessfulSync ?? undefined

  await writeSyncState({ status: 'running', lastAttempt: new Date().toISOString() })

  let recordsProcessed = 0
  try {
    recordsProcessed += await syncLeads(since)
    recordsProcessed += await syncAttendants()
    recordsProcessed += await syncTags()
    recordsProcessed += await syncPipelines()

    const finalState: SyncStateDoc = {
      lastSuccessfulSync: new Date().toISOString(),
      lastAttempt: new Date().toISOString(),
      status: 'success',
      error: null,
      recordsProcessed,
      duration: Date.now() - startedAt,
    }
    await writeSyncState(finalState)
    return finalState
  } catch (err) {
    const errorState: Partial<SyncStateDoc> = {
      lastAttempt: new Date().toISOString(),
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      recordsProcessed,
      duration: Date.now() - startedAt,
    }
    await writeSyncState(errorState)
    throw err
  }
}
