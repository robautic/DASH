// Rate limiter centralizado para chamadas à API do DataCrazy.
//
// A DataCrazy limita 60 requisições/minuto POR ROTA (ver
// https://docs.datacrazy.io/essencials/rate-limit.md) e devolve 429 +
// header Retry-After quando estoura. Este limiter garante, por rota:
//  - fila (nada de disparar tudo de uma vez / nada de Promise.all solto);
//  - intervalo mínimo entre chamadas (60/min => ~1 a cada 1000ms, com folga);
//  - concorrência máxima de 1 chamada em voo por rota;
//  - respeito ao Retry-After quando vem 429;
//  - backoff exponencial em erros de rede/5xx, com número de tentativas limitado;
//  - timeout por chamada;
//  - deduplicação: uma chamada idêntica (mesma dedupeKey) já em voo é
//    reaproveitada em vez de disparar outra igual.

interface QueueTask<T> {
  run: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason: unknown) => void
}

export interface RateLimiterOptions {
  /** Intervalo mínimo entre o início de duas chamadas na mesma fila (ms). */
  minIntervalMs?: number
  /** Timeout por chamada (ms). */
  timeoutMs?: number
  /** Número máximo de tentativas (incluindo a primeira) em erro de rede/5xx. */
  maxRetries?: number
  /** Backoff base (ms) — cresce exponencialmente: base * 2^tentativa. */
  backoffBaseMs?: number
}

const DEFAULTS: Required<RateLimiterOptions> = {
  minIntervalMs: 1_050, // levemente acima de 60/min para não flertar com o limite
  timeoutMs: 15_000,
  maxRetries: 3,
  backoffBaseMs: 500,
}

class RouteQueue {
  private queue: QueueTask<unknown>[] = []
  private processing = false
  private lastStartedAt = 0

  constructor(private readonly options: Required<RateLimiterOptions>) {}

  enqueue<T>(run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ run, resolve, reject } as QueueTask<unknown>)
      void this.process()
    })
  }

  private async process() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0) {
      const wait = this.options.minIntervalMs - (Date.now() - this.lastStartedAt)
      if (wait > 0) await sleep(wait)

      const task = this.queue.shift()
      if (!task) break

      this.lastStartedAt = Date.now()
      try {
        const result = await task.run()
        task.resolve(result)
      } catch (err) {
        task.reject(err)
      }
    }

    this.processing = false
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Erro lançado quando uma chamada estoura o timeout configurado. */
export class RateLimiterTimeoutError extends Error {
  constructor(ms: number) {
    super(`Chamada excedeu o timeout de ${ms}ms`)
    this.name = 'RateLimiterTimeoutError'
  }
}

/** Erro repassado ao chamador quando o retry chega ao limite. */
export class RateLimiterExhaustedError extends Error {
  constructor(public readonly cause: unknown, attempts: number) {
    super(`Chamada falhou após ${attempts} tentativa(s)`)
    this.name = 'RateLimiterExhaustedError'
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new RateLimiterTimeoutError(ms)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

/** Erro que carrega um Retry-After (em segundos), lançado pelo client em 429. */
export class RateLimitedError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(`429 recebido — aguardar ${retryAfterSeconds}s`)
    this.name = 'RateLimitedError'
  }
}

/** Erro que sinaliza um 5xx/erro de rede — elegível a retry com backoff. */
export class RetryableError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'RetryableError'
  }
}

export class DataCrazyRateLimiter {
  private readonly queues = new Map<string, RouteQueue>()
  private readonly inFlight = new Map<string, Promise<unknown>>()
  private readonly options: Required<RateLimiterOptions>
  private stats = { totalRequests: 0, rateLimited429Count: 0, retryExhaustedCount: 0 }

  constructor(options: RateLimiterOptions = {}) {
    this.options = { ...DEFAULTS, ...options }
  }

  /** Contadores acumulados desde que o processo subiu — usados pela tela de Monitoramento (Fase 7). */
  getStats() {
    return { ...this.stats }
  }

  private queueFor(routeKey: string): RouteQueue {
    let queue = this.queues.get(routeKey)
    if (!queue) {
      queue = new RouteQueue(this.options)
      this.queues.set(routeKey, queue)
    }
    return queue
  }

  /**
   * Executa `run` respeitando fila/intervalo por `routeKey`, com timeout,
   * retry+backoff em RetryableError e espera de Retry-After em
   * RateLimitedError. Se `dedupeKey` for passado e já houver uma chamada
   * idêntica em voo, reaproveita a mesma Promise em vez de duplicar.
   */
  async schedule<T>(routeKey: string, run: () => Promise<T>, dedupeKey?: string): Promise<T> {
    const key = dedupeKey ? `${routeKey}:${dedupeKey}` : undefined
    if (key && this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>
    }

    this.stats.totalRequests += 1
    const promise = this.queueFor(routeKey).enqueue(() => this.runWithRetry(run))
    if (key) {
      this.inFlight.set(key, promise)
      promise.finally(() => this.inFlight.delete(key)).catch(() => {})
    }
    return promise
  }

  private async runWithRetry<T>(run: () => Promise<T>): Promise<T> {
    let attempt = 0
    let lastError: unknown

    while (attempt < this.options.maxRetries) {
      attempt += 1
      try {
        return await withTimeout(run(), this.options.timeoutMs)
      } catch (err) {
        lastError = err

        if (err instanceof RateLimitedError) {
          this.stats.rateLimited429Count += 1
          await sleep(err.retryAfterSeconds * 1000)
          continue // não conta como tentativa "gasta" — a API pediu explicitamente pra esperar
        }

        if (err instanceof RetryableError || err instanceof RateLimiterTimeoutError) {
          if (attempt >= this.options.maxRetries) break
          const backoff = this.options.backoffBaseMs * 2 ** (attempt - 1)
          await sleep(backoff)
          continue
        }

        // Erro não-retryable (ex.: 4xx de validação) — falha imediatamente.
        throw err
      }
    }

    this.stats.retryExhaustedCount += 1
    throw new RateLimiterExhaustedError(lastError, attempt)
  }
}

/** Instância única compartilhada por toda a camada services/datacrazy. */
export const datacrazyRateLimiter = new DataCrazyRateLimiter()
