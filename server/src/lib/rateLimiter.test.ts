import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DataCrazyRateLimiter,
  RateLimitedError,
  RateLimiterExhaustedError,
  RateLimiterTimeoutError,
  RetryableError,
} from './rateLimiter.js'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DataCrazyRateLimiter', () => {
  it('executa duas chamadas na mesma rota respeitando o intervalo mínimo', async () => {
    const limiter = new DataCrazyRateLimiter({ minIntervalMs: 1000 })
    const started: number[] = []
    const run = () => {
      started.push(Date.now())
      return Promise.resolve('ok')
    }

    const p1 = limiter.schedule('leads', run)
    const p2 = limiter.schedule('leads', run)

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    await Promise.all([p1, p2])

    expect(started).toHaveLength(2)
    expect(started[1] - started[0]).toBeGreaterThanOrEqual(1000)
  })

  it('rotas diferentes não esperam uma pela outra', async () => {
    const limiter = new DataCrazyRateLimiter({ minIntervalMs: 5000 })
    let leadsRan = false
    let conversationsRan = false

    const pLeads = limiter.schedule('leads', async () => {
      leadsRan = true
      return 'leads'
    })
    const pConversations = limiter.schedule('conversations', async () => {
      conversationsRan = true
      return 'conversations'
    })

    await vi.advanceTimersByTimeAsync(0)
    await Promise.all([pLeads, pConversations])

    // Ambas rodaram sem precisar esperar 5s uma da outra — filas são por rota.
    expect(leadsRan).toBe(true)
    expect(conversationsRan).toBe(true)
  })

  it('reaproveita uma chamada em voo quando dedupeKey é igual', async () => {
    const limiter = new DataCrazyRateLimiter({ minIntervalMs: 0 })
    let callCount = 0
    const run = async () => {
      callCount += 1
      return 'result'
    }

    const p1 = limiter.schedule('leads', run, 'lead-123')
    const p2 = limiter.schedule('leads', run, 'lead-123')

    await vi.advanceTimersByTimeAsync(0)
    const [r1, r2] = await Promise.all([p1, p2])

    expect(callCount).toBe(1)
    expect(r1).toBe('result')
    expect(r2).toBe('result')
  })

  it('faz retry com backoff exponencial em RetryableError, até maxRetries', async () => {
    const limiter = new DataCrazyRateLimiter({ minIntervalMs: 0, backoffBaseMs: 100, maxRetries: 3 })
    let attempts = 0
    const run = async () => {
      attempts += 1
      throw new RetryableError('falha simulada')
    }

    const promise = limiter.schedule('leads', run)
    const assertion = expect(promise).rejects.toBeInstanceOf(RateLimiterExhaustedError)

    // 2 backoffs entre as 3 tentativas: 100ms, depois 200ms.
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)

    await assertion
    expect(attempts).toBe(3)
    expect(limiter.getStats().retryExhaustedCount).toBe(1)
  })

  it('espera o Retry-After completo em RateLimitedError e NÃO conta como tentativa gasta', async () => {
    const limiter = new DataCrazyRateLimiter({ minIntervalMs: 0, maxRetries: 2 })
    let attempts = 0
    const run = async () => {
      attempts += 1
      if (attempts === 1) throw new RateLimitedError(3) // pede 3s de espera
      return 'ok-depois-do-429'
    }

    const promise = limiter.schedule('leads', run)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(3000)

    await expect(promise).resolves.toBe('ok-depois-do-429')
    expect(attempts).toBe(2)
    expect(limiter.getStats().rateLimited429Count).toBe(1)
  })

  it('estoura RateLimiterTimeoutError quando a chamada demora mais que timeoutMs', async () => {
    const limiter = new DataCrazyRateLimiter({ minIntervalMs: 0, timeoutMs: 500, maxRetries: 1 })
    const run = () => new Promise(() => {}) // nunca resolve

    const promise = limiter.schedule('leads', run)
    const assertion = expect(promise).rejects.toBeInstanceOf(RateLimiterExhaustedError)

    await vi.advanceTimersByTimeAsync(500)
    await assertion
  })

  it('erro não-retryable falha imediatamente, sem consumir tentativas extras', async () => {
    const limiter = new DataCrazyRateLimiter({ minIntervalMs: 0, maxRetries: 3 })
    let attempts = 0
    const run = async () => {
      attempts += 1
      throw new Error('erro de validação, não deveria ter retry')
    }

    const promise = limiter.schedule('leads', run)
    await vi.advanceTimersByTimeAsync(0)

    await expect(promise).rejects.toThrow('erro de validação')
    expect(attempts).toBe(1)
  })
})
