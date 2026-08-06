import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { fetchConversations } from "../services/datacrazy/conversations";

export const conversationsRouter = router({
  list: publicProcedure
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
        console.error("[ConversationsRouter] Error fetching conversations:", error);
        return { count: 0, data: [] };
      }
    }),
});
