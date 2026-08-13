// Logger estruturado central. Em produção sai JSON (uma linha por evento,
// fácil de indexar em qualquer coletor de log); em dev sai formatado e
// colorido via pino-pretty.
//
// Por que isso importa pro spec: "MONITORAMENTO" pede visibilidade sobre
// erros de sync/429/etc, e isso é inviável se cada módulo usa
// console.log/console.error com formato próprio.
import pino from 'pino'
import { env } from '../config/env.js'

export const logger = pino({
  level: env.logLevel,
  transport:
    env.nodeEnv === 'production'
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
})

export function childLogger(module: string) {
  return logger.child({ module })
}
