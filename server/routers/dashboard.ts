import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDashboardStore } from "../cache/store";
import { runSyncWorker } from "../services/datacrazy/syncWorker";
import { fetchAttendants, fetchInstances } from "../services/datacrazy/agents";
import { fetchLeads, fetchBusinesses, fetchPipelines, fetchPipelineStages } from "../services/datacrazy/leads";
import { fetchConversations } from "../services/datacrazy/conversations";
import { fetchDepartments } from "../services/datacrazy/departments";

export const dashboardRouter = router({
  full: protectedProcedure.query(async ({ ctx }) => {
    try {
      const store = getDashboardStore();
      // If store hasn't synced yet, run worker in background and return store
      if (store.lastSyncTime === 0 && !store.isSyncing) {
        runSyncWorker().catch(console.error);
      }

      // 3. Strict Permission Filtering
      if (ctx.user && ctx.user.role !== "admin") {
        const userName = ctx.user.name;
        return {
          ...store,
          leads: store.leads?.filter((l: any) => l.atendente === userName || l.agent === userName || l.atendente === ctx.user.email),
          businesses: store.businesses?.filter((b: any) => b.atendente === userName || b.agent === userName || b.owner === userName),
          conversations: store.conversations?.filter((c: any) => c.atendente === userName || c.agent === userName)
        };
      }

      return store;
    } catch (error) {
      console.error("[DashboardRouter] Error fetching full data:", error);
      return getDashboardStore();
    }
  }),

  departments: protectedProcedure.query(async () => {
    try {
      const store = getDashboardStore();
      if (store.departments && store.departments.length > 0) return store.departments;
      const result = await fetchDepartments();
      return result.data || [];
    } catch (error) {
      console.error("[DashboardRouter] Error fetching departments:", error);
      return [];
    }
  }),

  attendants: protectedProcedure.query(async () => {
    try {
      const store = getDashboardStore();
      if (store.attendants && store.attendants.length > 0) return store.attendants;
      const result = await fetchAttendants();
      return result.data || [];
    } catch (error) {
      console.error("[DashboardRouter] Error fetching attendants:", error);
      return [];
    }
  }),

  leads: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const store = getDashboardStore();
        
        // Apply RBAC filtering
        let allLeads = store.leads || [];
        if (ctx.user && ctx.user.role !== "admin") {
          const userName = ctx.user.name;
          allLeads = allLeads.filter((l: any) => l.atendente === userName || l.agent === userName || l.atendente === ctx.user.email);
        }

        if (allLeads.length > 0) {
          const sliced = allLeads.slice(input.skip, input.skip + input.take);
          return { count: allLeads.length, data: sliced };
        }
        const result = await fetchLeads(input.skip, input.take);
        
        // Also filter fetch result if falling back
        let fetchedLeads = result.data || [];
        if (ctx.user && ctx.user.role !== "admin") {
          const userName = ctx.user.name;
          fetchedLeads = fetchedLeads.filter((l: any) => l.atendente === userName || l.agent === userName || l.atendente === ctx.user.email);
        }

        return { count: result.count || fetchedLeads.length || 0, data: fetchedLeads };
      } catch (error) {
        console.error("[DashboardRouter] Error fetching leads:", error);
        return { count: 0, data: [] };
      }
    }),

  instances: protectedProcedure.query(async () => {
    try {
      const store = getDashboardStore();
      if (store.instances && store.instances.length > 0) {
        return { count: store.instances.length, data: store.instances };
      }
      const result = await fetchInstances();
      return { count: result.count || result.data?.length || 0, data: result.data || [] };
    } catch (error) {
      console.error("[DashboardRouter] Error fetching instances:", error);
      return { count: 0, data: [] };
    }
  }),

  businesses: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(100),
        pipelineId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const store = getDashboardStore();
        if (store.businesses && store.businesses.length > 0) {
          const sliced = store.businesses.slice(input.skip, input.skip + input.take);
          return { count: store.businesses.length, data: sliced };
        }
        const filters: Record<string, string> = {};
        if (input.pipelineId) {
          filters.pipelineId = input.pipelineId;
        }
        const result = await fetchBusinesses(input.skip, input.take, filters);
        return { count: result.count || result.data?.length || 0, data: result.data || [] };
      } catch (error) {
        console.error("[DashboardRouter] Error fetching businesses:", error);
        return { count: 0, data: [] };
      }
    }),

  pipelines: protectedProcedure.query(async () => {
    try {
      const result = await fetchPipelines();
      return result.data || [];
    } catch (error) {
      console.error("[DashboardRouter] Error fetching pipelines:", error);
      return [];
    }
  }),

  pipelineStages: protectedProcedure
    .input(z.object({ pipelineId: z.string() }))
    .query(async ({ input }) => {
      try {
        const store = getDashboardStore();
        if (store.stages && store.stages.length > 0) {
          return { count: store.stages.length, data: store.stages };
        }
        const result = await fetchPipelineStages(input.pipelineId);
        return { count: result.count || result.data?.length || 0, data: result.data || [] };
      } catch (error) {
        console.error("[DashboardRouter] Error fetching pipeline stages:", error);
        return { count: 0, data: [] };
      }
    }),

  conversations: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const store = getDashboardStore();
        if (store.conversations && store.conversations.length > 0) {
          const sliced = store.conversations.slice(input.skip, input.skip + input.take);
          return { count: store.conversations.length, data: sliced };
        }
        const result = await fetchConversations(input.skip, input.take);
        return { count: result.count || 0, data: result.data || [] };
      } catch (error) {
        console.error("[DashboardRouter] Error fetching conversations:", error);
        return { count: 0, data: [] };
      }
    }),
});
