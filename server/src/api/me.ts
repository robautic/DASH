// GET /api/me — perfil do usuário autenticado (usado pelo frontend logo
// após o login pra decidir o que mostrar/esconder na UI).
import { Router } from 'express'

export const meRouter = Router()

meRouter.get('/me', (req, res) => {
  res.json(req.authUser)
})
