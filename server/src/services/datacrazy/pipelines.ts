// GET /pipelines, GET /pipelines/{id}, GET /pipelines/{id}/stages
import { datacrazyClient } from './client.js'
import type { PipelineDoc, StageDoc } from '../../types/firestore.js'

export interface DataCrazyStage {
  id: string
  name: string
  color?: string
  index: number
}

export interface DataCrazyPipeline {
  id: string
  name: string
  group?: string
}

const ROUTE = '/api/v1/pipelines'

export function getPipelines() {
  return datacrazyClient.get<{ count: number; data: DataCrazyPipeline[] }>('api/v1/pipelines', {
    routeKey: ROUTE,
  })
}

export function getPipelineById(id: string) {
  return datacrazyClient.get<DataCrazyPipeline>(`api/v1/pipelines/${id}`, {
    routeKey: `${ROUTE}/:id`,
    dedupeKey: id,
  })
}

export function getPipelineStages(id: string) {
  return datacrazyClient.get<{ count: number; data: DataCrazyStage[] }>(`api/v1/pipelines/${id}/stages`, {
    routeKey: `${ROUTE}/:id/stages`,
    dedupeKey: id,
  })
}

export function toFirestorePipeline(dto: DataCrazyPipeline): PipelineDoc {
  return { id: dto.id, name: dto.name, group: dto.group ?? null, syncedAt: new Date().toISOString() }
}

export function toFirestoreStage(dto: DataCrazyStage, pipelineId: string): StageDoc {
  return {
    id: dto.id,
    pipelineId,
    name: dto.name,
    color: dto.color ?? null,
    index: dto.index,
    syncedAt: new Date().toISOString(),
  }
}
