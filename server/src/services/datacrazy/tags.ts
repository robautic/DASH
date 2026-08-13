// GET /tags, GET /tags/{id} — CRUD completo existe na API, mas o LeadDash só
// precisa ler (a criação/edição de tags continua sendo feita no DataCrazy).
import { datacrazyClient } from './client.js'
import type { DataCrazyTag } from './leads.js'
import type { TagDoc } from '../../types/firestore.js'

const ROUTE = '/api/v1/tags'

export function getTags() {
  return datacrazyClient.get<{ count: number; data: DataCrazyTag[] }>('api/v1/tags', {
    routeKey: ROUTE,
  })
}

export function getTagById(id: string) {
  return datacrazyClient.get<DataCrazyTag>(`api/v1/tags/${id}`, {
    routeKey: `${ROUTE}/:id`,
    dedupeKey: id,
  })
}

export function toFirestoreTag(dto: DataCrazyTag): TagDoc {
  return {
    id: dto.id,
    name: dto.name,
    color: dto.color,
    description: dto.description ?? null,
    createdAt: dto.createdAt,
    syncedAt: new Date().toISOString(),
  }
}
