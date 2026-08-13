// Router raiz de server/api/ — monta cada sub-rota. Tudo aqui já passa por
// requireAuth (montado em index.ts antes deste router), então toda rota
// abaixo pode assumir req.authUser preenchido.
import { Router } from 'express'
import { meRouter } from './me.js'
import { usersRouter } from './users.js'
import { leadsRouter } from './leads.js'
import { referenceDataRouter } from './referenceData.js'
import { dashboardRouter } from './dashboard.js'
import { attendantsPerformanceRouter } from './attendantsPerformance.js'
import { teamRouter } from './team.js'
import { conversionsRouter } from './conversions.js'
import { goalsRouter } from './goals.js'
import { auditLogsRouter } from './auditLogs.js'
import { reportsRouter } from './reports.js'
import { monitoringRouter } from './monitoring.js'

export const apiRouter = Router()

apiRouter.use(meRouter)
apiRouter.use(usersRouter)
apiRouter.use(leadsRouter)
apiRouter.use(referenceDataRouter)
apiRouter.use(dashboardRouter)
apiRouter.use(attendantsPerformanceRouter)
apiRouter.use(teamRouter)
apiRouter.use(conversionsRouter)
apiRouter.use(goalsRouter)
apiRouter.use(auditLogsRouter)
apiRouter.use(reportsRouter)
apiRouter.use(monitoringRouter)
