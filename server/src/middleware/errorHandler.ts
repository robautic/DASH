// Handler global de erros do Express. Precisa ser o ÚLTIMO app.use() em
// index.ts (assinatura de 4 args é o que o Express usa pra reconhecer um
// error handler). Sem isso, qualquer exceção não tratada numa rota async
// derruba a conexão sem resposta (ou, pior, vaza stack trace pro cliente).
import type { NextFunction, Request, Response } from 'express'
import { logger } from '../lib/logger.js'
import { env } from '../config/env.js'
import { DataCrazyApiError } from '../services/datacrazy/client.js'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

// Envolve um handler async pra que rejections virem next(err) automaticamente
// — o Express 4 não faz isso sozinho pra funções async.
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isHttpError = err instanceof HttpError
  const isDatacrazyError = err instanceof DataCrazyApiError
  const status = isHttpError ? err.status : isDatacrazyError ? 502 : 500

  const message = err instanceof Error ? err.message : 'Erro desconhecido'

  logger.error(
    { err, path: req.path, method: req.method, status, uid: req.authUser?.uid },
    'Erro não tratado na requisição',
  )

  res.status(status).json({
    error: status >= 500 ? 'Erro interno do servidor' : message,
    // Detalhe da mensagem original só em dev — em produção nunca vazar
    // stack/mensagem interna pro cliente em erros 5xx.
    ...(env.nodeEnv !== 'production' && status >= 500 ? { detail: message } : {}),
  })
}
