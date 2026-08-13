// GET /attendants/multi — lista de atendentes do multiatendimento. Endpoint
// não é paginado (retorna todos de uma vez), então não usa paginateAll.
import { datacrazyClient } from './client.js'
import type { DataCrazyAttendant } from './leads.js'
import type { AttendantDoc } from '../../types/firestore.js'

const ROUTE = '/api/v1/attendants/multi'

export function getAttendants() {
  return datacrazyClient.get<{ count: number; data: DataCrazyAttendant[] }>('api/v1/attendants/multi', {
    routeKey: ROUTE,
  })
}

export function toFirestoreAttendant(dto: DataCrazyAttendant): AttendantDoc {
  return {
    id: dto.id,
    userId: dto.userId,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? null,
    imageURL: dto.imageURL ?? null,
    syncedAt: new Date().toISOString(),
  }
}
