import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { dashboardRouter } from "./routers/dashboard";
import { leadsRouter } from "./routers/leads";
import { agentsRouter } from "./routers/agents";
import { conversationsRouter } from "./routers/conversations";
import { metricsRouter } from "./routers/metrics";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  dashboard: dashboardRouter,
  leads: leadsRouter,
  agents: agentsRouter,
  conversations: conversationsRouter,
  metrics: metricsRouter,
});

export type AppRouter = typeof appRouter;
