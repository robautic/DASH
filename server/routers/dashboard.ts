import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDashboardStore } from "../cache/store";
import { runSyncWorker } from "../services/datacrazy/syncWorker";
import { fetchAttendants, fetchInstances } from "../services/datacrazy/agents";
import { fetchLeads, fetchBusinesses, fetchPipelines, fetchPipelineStages } from "../services/datacrazy/leads";
import { fetchConversations } from "../services/datacrazy/conversations";
import { fetchDepartments } from "../services/datacrazy/departments";

export const dashboardRouter = router({
  full: publicProcedure.query(async () => {
    try {
      const store = getDashboardStore();
      // If store hasn't synced yet, run worker in background and return store
      if (store.lastSyncTime === 0 && !store.isSyncing) {
        runSyncWorker().catch(console.error);
      }
      return store;
    } catch (error) {
      console.error("[DashboardRouter] Error fetching full data:", error);
      return getDashboardStore();
    }
  }),

  departments: publicProcedure.query(async () => {
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

  attendants: publicProcedure.query(async () => {
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

  leads: publicProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        const store = getDashboardStore();
        if (store.leads && store.leads.length > 0) {
          const sliced = store.leads.slice(input.skip, input.skip + input.take);
          return { count: store.leads.length, data: sliced };
        }
        const result = await fetchLeads(input.skip, input.take);
        return { count: result.count || result.data?.length || 0, data: result.data || [] };
      } catch (error) {
        console.error("[DashboardRouter] Error fetching leads:", error);
        return { count: 0, data: [] };
      }
    }),

  instances: publicProcedure.query(async () => {
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

  businesses: publicProcedure
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

  pipelines: publicProcedure.query(async () => {
    try {
      const result = await fetchPipelines();
      return result.data || [];
    } catch (error) {
      console.error("[DashboardRouter] Error fetching pipelines:", error);
      return [];
    }
  }),

  pipelineStages: publicProcedure
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

  conversations: publicProcedure
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
