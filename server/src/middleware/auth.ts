// Middleware de autenticação/autorização.
// Fluxo: Authorization: Bearer <idToken do Firebase> -> adminAuth.verifyIdToken
// -> carrega users/{uid} no Firestore -> anexa req.authUser -> rotas de
// server/api/ decidem o que cada role pode ver a partir daí (ver lib/authz.ts).
import type { NextFunction, Request, Response } from 'express'
import { adminAuth } from '../lib/firebaseAdmin.js'
import { collections } from '../lib/collections.js'
import type { Role, UserDoc } from '../types/firestore.js'

export interface AuthUser {
  uid: string
  email: string
  role: Role
  departmentIds: string[]
  attendantId: string | null
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      authUser?: AuthUser
    }
  }
}

function toAuthUser(uid: string, doc: UserDoc): AuthUser {
  return {
    uid,
    email: doc.email,
    role: doc.role,
    departmentIds: doc.departmentIds ?? [],
    attendantId: doc.attendantId ?? null,
  }
}

/**
 * Exige um ID token válido do Firebase E um documento em users/{uid} já
 * provisionado (role atribuído). Um usuário autenticado no Firebase mas sem
 * doc em `users` ainda não tem permissão nenhuma no LeadDash — 403, não 401,
 * porque a autenticação em si funcionou.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? req.header('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação ausente' })
    return
  }

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(token)
  } catch {
    res.status(401).json({ error: 'Token de autenticação inválido ou expirado' })
    return
  }

  const userSnap = await collections.users.doc(decoded.uid).get()
  if (!userSnap.exists) {
    res.status(403).json({ error: 'Usuário autenticado mas sem acesso provisionado no LeadDash' })
    return
  }

  req.authUser = toAuthUser(decoded.uid, userSnap.data()!)
  next()
}

/** Restringe a rota a um subconjunto de roles. Usar sempre depois de requireAuth. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      res.status(401).json({ error: 'Não autenticado' })
      return
    }
    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({ error: `Esta ação exige um dos papéis: ${roles.join(', ')}` })
      return
    }
    next()
  }
}
