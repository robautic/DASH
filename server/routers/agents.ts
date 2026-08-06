import { publicProcedure, router } from "../_core/trpc";
import { fetchAttendants } from "../services/datacrazy/agents";
import { fetchAllBusinesses } from "../services/datacrazy/leads";
import { fetchAllConversations } from "../services/datacrazy/conversations";
import { calculateAgentPerformance } from "../analytics/performance";

export const agentsRouter = router({
  list: publicProcedure.query(async () => {
    try {
      const result = await fetchAttendants();
      return result.data || [];
    } catch (error) {
      console.error("[AgentsRouter] Error fetching agents:", error);
      return [];
    }
  }),

  performance: publicProcedure.query(async () => {
    try {
      const [attendantsRes, businessesRes, conversationsRes] = await Promise.allSettled([
        fetchAttendants(),
        fetchAllBusinesses(),
        fetchAllConversations(),
      ]);

      const atts = attendantsRes.status === "fulfilled" ? attendantsRes.value.data : [];
      const bizs = businessesRes.status === "fulfilled" ? businessesRes.value.data : [];
      const convs = conversationsRes.status === "fulfilled" ? conversationsRes.value.data : [];

      return calculateAgentPerformance(atts, bizs, convs);
    } catch (error) {
      console.error("[AgentsRouter] Error calculating performance:", error);
      return [];
    }
  }),
});
