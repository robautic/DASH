import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'
import { datacrazyWebhookRouter } from './webhooks/datacrazyWebhookRouter.js'
import { runDatacrazySync } from './workers/datacrazySyncWorker.js'
import { apiRouter } from './api/router.js'
import { requireAuth, requireRole } from './middleware/auth.js'
import { asyncHandler, errorHandler } from './middleware/errorHandler.js'

const app = express()

// Atrás de um proxy/load balancer (Cloud Run, etc.) — necessário pro
// express-rate-limit e pro log de IP lerem o IP real do cliente em vez do
// IP do proxy.
app.set('trust proxy', 1)

app.use(helmet())

// CORS restrito às origens configuradas em ALLOWED_ORIGINS. Em dev, se a
// variável não estiver setada, libera geral pra não travar quem está
// rodando local; em produção, uma lista vazia significa "nenhuma origem
// autorizada" (fail-closed, não fail-open).
app.use(
  cors({
    origin(origin, callback) {
      if (env.nodeEnv !== 'production') return callback(null, true)
      if (!origin) return callback(null, true) // requisições server-to-server (sem Origin)
      if (env.allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`Origem não autorizada pelo CORS: ${origin}`))
    },
  }),
)

app.use(express.json({ limit: '1mb' }))

app.use(
  pinoHttp({
    logger,
    // Não logar corpo/headers sensíveis (Authorization carrega o ID token).
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    autoLogging: { ignore: (req) => req.url === '/health' },
  }),
)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'leaddash-server' })
})

// Webhooks do DataCrazy têm autenticação própria (x-webhook-secret, ver
// webhooks/datacrazyWebhookRouter.ts) — não passam por requireAuth, que é
// pra usuários do LeadDash autenticados via Firebase.
app.use('/webhooks', datacrazyWebhookRouter)

// Rate limit da própria API do LeadDash (distinto do rate limiter de saída
// pro DataCrazy, em lib/rateLimiter.ts) — protege contra abuso/loop de
// cliente, não contra o DataCrazy.
const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300, // por IP autenticado, por minuto — folgado o bastante pro uso normal do dashboard
  standardHeaders: true,
  legacyHeaders: false,
})

// API do frontend — tudo daqui pra baixo exige um usuário do LeadDash
// autenticado e provisionado (ver middleware/auth.ts).
app.use('/api', apiLimiter, requireAuth, apiRouter)

// Endpoint manual pra disparar o sync worker (cron externo/Cloud Scheduler).
// Só ADMIN — mesmo padrão de autenticação da API normal.
app.post(
  '/internal/sync/datacrazy',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    const result = await runDatacrazySync()
    res.status(200).json(result)
  }),
)

// Handler de erro global — precisa ser o ÚLTIMO app.use().
app.use(errorHandler)

app.listen(env.port, () => {
  logger.info({ port: env.port, nodeEnv: env.nodeEnv }, 'LeadDash server no ar')
})
