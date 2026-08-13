// Única porta de saída para a API do DataCrazy. Todo o resto da camada
// services/datacrazy/ (e o resto do backend) deve passar por aqui — nunca
// chamar fetch() direto para api.g1.datacrazy.io em outro lugar.
import { env } from '../../config/env.js'
import {
  datacrazyRateLimiter,
  RateLimitedError,
  RetryableError,
} from '../../lib/rateLimiter.js'

export class DataCrazyApiError extends Error {
  constructor(public readonly status: number, public readonly body: unknown) {
    super(`DataCrazy API respondeu ${status}`)
    this.name = 'DataCrazyApiError'
  }
}

export interface PaginatedResponse<T> {
  count: number
  data: T[]
}

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
  /** Usado para agrupar a chamada na fila certa do rate limiter (uma fila por rota). */
  routeKey: string
  /** Se passado, deduplica chamadas idênticas em voo (ver rateLimiter.ts). */
  dedupeKey?: string
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, env.datacrazy.baseUrl.endsWith('/') ? env.datacrazy.baseUrl : `${env.datacrazy.baseUrl}/`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function request<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, options: RequestOptions): Promise<T> {
  if (!env.datacrazy.apiToken) {
    throw new Error('DATACRAZY_API_TOKEN não configurado — ver .env.example')
  }

  return datacrazyRateLimiter.schedule(
    options.routeKey,
    async () => {
      let response: Response
      try {
        response = await fetch(buildUrl(path.replace(/^\//, ''), options.query), {
          method,
          headers: {
            Authorization: `Bearer ${env.datacrazy.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        })
      } catch (err) {
        // Falha de rede — elegível a retry com backoff.
        throw new RetryableError('Falha de rede ao chamar a API do DataCrazy', err)
      }

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('Retry-After') ?? '5')
        throw new RateLimitedError(Number.isFinite(retryAfter) ? retryAfter : 5)
      }

      if (response.status >= 500) {
        throw new RetryableError(`DataCrazy API respondeu ${response.status}`)
      }

      const text = await response.text()
      let json: unknown
      try {
        json = text ? JSON.parse(text) : undefined
      } catch {
        // Corpo não-JSON (ex.: página de erro de um proxy/gateway na frente
        // da API). Trata como retryable em vez de deixar o SyntaxError
        // cru subir — um 5xx/gateway costuma ser transitório.
        throw new RetryableError(`DataCrazy API respondeu corpo não-JSON (status ${response.status})`)
      }

      if (!response.ok) {
        // 4xx (exceto 429) não é retryable — é erro de request, falha na hora.
        throw new DataCrazyApiError(response.status, json)
      }

      return json as T
    },
    options.dedupeKey,
  )
}

export const datacrazyClient = {
  get: <T>(path: string, options: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, options: RequestOptions) => request<T>('POST', path, options),
  patch: <T>(path: string, options: RequestOptions) => request<T>('PATCH', path, options),
  delete: <T>(path: string, options: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, options),
}

/**
 * Percorre um endpoint paginado (skip/take + { count, data }) inteiro,
 * uma página por vez, respeitando o rate limiter a cada chamada.
 * Usado pela sincronização inicial completa.
 */
export async function* paginateAll<T>(
  path: string,
  routeKey: string,
  query: Record<string, string | number | boolean | undefined> = {},
  pageSize = 100,
): AsyncGenerator<T[]> {
  let skip = 0
  while (true) {
    const page = await datacrazyClient.get<PaginatedResponse<T>>(path, {
      routeKey,
      query: { ...query, skip, take: pageSize },
    })
    if (page.data.length === 0) return
    yield page.data
    skip += page.data.length
    if (skip >= page.count) return
  }
}
