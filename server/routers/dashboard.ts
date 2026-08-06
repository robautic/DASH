import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getCachedDashboardData, setCachedDashboardData } from "../cache/dashboard";
import { fetchAttendants, fetchInstances } from "../services/datacrazy/agents";
import { fetchLeads, fetchBusinesses, fetchPipelines, fetchPipelineStages, fetchAllLeads, fetchAllBusinesses } from "../services/datacrazy/leads";
import { fetchConversations, fetchAllConversations } from "../services/datacrazy/conversations";
import { fetchDepartments } from "../services/datacrazy/departments";

const PIPELINE_VALUE_ID = "3922b55e-f151-4fa4-ac85-9f2767272419";

async function getDashboardFull() {
  const cached = getCachedDashboardData("dashboard");
  if (cached) return cached;

  const pause = () => new Promise((r) => setTimeout(r, 200));

  const attendants = await fetchAttendants().catch(() => ({ data: [] }));
  await pause();
  const departments = await fetchDepartments().catch(() => ({ data: [] }));
  await pause();
  const instances = await fetchInstances().catch(() => ({ data: [] }));
  await pause();
  const stages = await fetchPipelineStages(PIPELINE_VALUE_ID).catch(() => ({ data: [] }));
  await pause();
  const leads = await fetchAllLeads().catch(() => ({ data: [] }));
  await pause();
  const businesses = await fetchAllBusinesses().catch(() => ({ data: [] }));
  await pause();
  const conversations = await fetchAllConversations().catch(() => ({ data: [] }));

  const attData = attendants.data || [];
  const leadsData = leads.data || [];
  const instData = instances.data || [];
  const bizData = businesses.data || [];
  const stagesData = stages.data || [];
  const convData = conversations.data || [];
  const deptData = departments.data || [];

  const result = {
    attendants: attData,
    leads: leadsData,
    instances: instData,
    businesses: bizData,
    stages: stagesData,
    conversations: convData,
    departments: deptData,
  };

  setCachedDashboardData(result, "dashboard");
  return result;
}

export const dashboardRouter = router({
  full: publicProcedure.query(async () => {
    try {
      return await getDashboardFull();
    } catch (error) {
      console.error("[DashboardRouter] Error fetching full data:", error);
      return {
        attendants: [],
        leads: [],
        instances: [],
        businesses: [],
        stages: [],
        conversations: [],
        departments: [],
      };
    }
  }),

  departments: publicProcedure.query(async () => {
    try {
      const result = await fetchDepartments();
      return result.data || [];
    } catch (error) {
      console.error("[DashboardRouter] Error fetching departments:", error);
      return [];
    }
  }),

  attendants: publicProcedure.query(async () => {
    try {
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
        const result = await fetchLeads(input.skip, input.take);
        return { count: result.count || result.data?.length || 0, data: result.data || [] };
      } catch (error) {
        console.error("[DashboardRouter] Error fetching leads:", error);
        return { count: 0, data: [] };
      }
    }),

  instances: publicProcedure.query(async () => {
    try {
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
        const result = await fetchConversations(input.skip, input.take);
        return { count: result.count || 0, data: result.data || [] };
      } catch (error) {
        console.error("[DashboardRouter] Error fetching conversations:", error);
        return { count: 0, data: [] };
      }
    }),
});
