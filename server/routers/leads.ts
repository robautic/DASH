import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { fetchLeads, fetchLeadById } from "../services/datacrazy/leads";

export const leadsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(100),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const filters: Record<string, string> = {};
        if (input.status) filters.status = input.status;
        if (input.search) filters.search = input.search;
        const result = await fetchLeads(input.skip, input.take, filters);
        return { count: result.count || 0, data: result.data || [] };
      } catch (error) {
        console.error("[LeadsRouter] Error listing leads:", error);
        return { count: 0, data: [] };
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const result = await fetchLeadById(input.id);
        return result;
      } catch (error) {
        console.error("[LeadsRouter] Error fetching lead by id:", error);
        return null;
      }
    }),
});
