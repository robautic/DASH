import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getCache } from "./cache";
import {
  fetchAttendants,
  fetchLeads,
  fetchInstances,
  fetchBusinesses,
  fetchPipelines,
  fetchPipelineStages,
  fetchConversations,
  fetchLead,
} from "./datacrazy";

const PIPELINE_VALUE_ID = "3922b55e-f151-4fa4-ac85-9f2767272419";

async function getDashboardFull() {
  // Try cache first
  const cached = getCache("dashboard");
  if (cached) return cached;

  // Cache miss - fetch from Datacrazy with Promise.allSettled for resilience
  const [attendants, leads, instances, businesses, stages, conversations] = await Promise.allSettled([
    fetchAttendants(),
    fetchLeads(0, 500),
    fetchInstances(),
    fetchBusinesses(0, 500, { pipelineId: PIPELINE_VALUE_ID }),
    fetchPipelineStages(PIPELINE_VALUE_ID),
    fetchConversations(0, 200),
  ]);

  const attData = attendants.status === "fulfilled" ? attendants.value.data || [] : [];
  const leadsData = leads.status === "fulfilled" ? leads.value.data || [] : [];
  const instData = instances.status === "fulfilled" ? instances.value.data || [] : [];
  const bizData = businesses.status === "fulfilled" ? businesses.value.data || [] : [];
  const stagesData = stages.status === "fulfilled" ? stages.value.data || [] : [];
  const convData = conversations.status === "fulfilled" ? conversations.value.data || [] : [];

  return {
    attendants: attData,
    leads: leadsData,
    instances: instData,
    businesses: bizData,
    stages: stagesData,
    conversations: convData,
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dashboard: router({
    /** Single endpoint that returns the full dashboard dataset (uses cache) */
    full: publicProcedure.query(async () => {
      try {
        return await getDashboardFull();
      } catch (error) {
        console.error("[Dashboard] Error fetching full data:", error);
        return {
          attendants: [],
          leads: [],
          instances: [],
          businesses: [],
          stages: [],
          conversations: [],
        };
      }
    }),

    attendants: publicProcedure.query(async () => {
      try {
        const result = await fetchAttendants();
        return result.data || [];
      } catch (error) {
        console.error("[Datacrazy] Error fetching attendants:", error);
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
          const result = await fetchLeads(input.skip, input.take);
          return { count: result.count || result.data?.length || 0, data: result.data || [] };
        } catch (error) {
          console.error("[Datacrazy] Error fetching leads:", error);
          return { count: 0, data: [] };
        }
      }),

    instances: publicProcedure.query(async () => {
      try {
        const result = await fetchInstances();
        return { count: result.count || result.data?.length || 0, data: result.data || [] };
      } catch (error) {
        console.error("[Datacrazy] Error fetching instances:", error);
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
          const filters: Record<string, string> = {};
          if (input.pipelineId) {
            filters.pipelineId = input.pipelineId;
          }
          const result = await fetchBusinesses(input.skip, input.take, filters);
          return { count: result.count || result.data?.length || 0, data: result.data || [] };
        } catch (error) {
          console.error("[Datacrazy] Error fetching businesses:", error);
          return { count: 0, data: [] };
        }
      }),

    pipelines: publicProcedure.query(async () => {
      try {
        const result = await fetchPipelines();
        return result.data || [];
      } catch (error) {
        console.error("[Datacrazy] Error fetching pipelines:", error);
        return [];
      }
    }),

    pipelineStages: publicProcedure
      .input(z.object({ pipelineId: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await fetchPipelineStages(input.pipelineId);
          return { count: result.count || result.data?.length || 0, data: result.data || [] };
        } catch (error) {
          console.error("[Datacrazy] Error fetching pipeline stages:", error);
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
          const result = await fetchConversations(input.skip, input.take);
          return { count: result.count || 0, data: result.data || [] };
        } catch (error) {
          console.error("[Datacrazy] Error fetching conversations:", error);
          return { count: 0, data: [] };
        }
      }),

    leadDetail: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await fetchLead(input.id);
          return result;
        } catch (error) {
          console.error("[Datacrazy] Error fetching lead:", error);
          return null;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
