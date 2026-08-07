import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { fetchLeads, fetchLeadById, updateLead } from "../services/datacrazy/leads";
import { getDashboardStore, updateDashboardStore } from "../cache/store";
import { db, doc, setDoc } from "../firebase";

export const leadsRouter = router({
  list: protectedProcedure
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

  getById: protectedProcedure
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

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.string().optional(),
      etapa: z.string().optional(),
      atendente: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const payload: any = {};
        if (input.status) payload.status = input.status;
        if (input.etapa) payload.stage = input.etapa; // DataCrazy might expect 'stage' or 'etapa'
        if (input.atendente) payload.agent = input.atendente; // DataCrazy might expect 'agent'

        // 1. Send update to DataCrazy API
        try {
          await updateLead(input.id, payload);
        } catch (apiError) {
          console.warn("[LeadsRouter] DataCrazy API update failed, proceeding with local update", apiError);
        }

        // 2. Update local dashboard store
        const store = getDashboardStore();
        let updatedLead = null;
        if (store.leads) {
          const idx = store.leads.findIndex((l: any) => String(l.id || l._id) === input.id);
          if (idx !== -1) {
            store.leads[idx] = {
              ...store.leads[idx],
              ...(input.status && { status: input.status }),
              ...(input.etapa && { etapa: input.etapa, stage: input.etapa }),
              ...(input.atendente && { atendente: input.atendente, agent: input.atendente })
            };
            updatedLead = store.leads[idx];
            updateDashboardStore(store);
          }
        }

        // 3. Update Firestore immediately
        if (updatedLead) {
          const leadRef = doc(db, "leads", input.id);
          await setDoc(leadRef, {
            ...updatedLead,
            updatedAt: Date.now()
          }, { merge: true });
        } else {
          // If not in local store, just update firestore blindly
          const leadRef = doc(db, "leads", input.id);
          await setDoc(leadRef, {
            ...(input.status && { status: input.status }),
            ...(input.etapa && { etapa: input.etapa }),
            ...(input.atendente && { atendente: input.atendente }),
            updatedAt: Date.now()
          }, { merge: true });
        }

        return { success: true, id: input.id };
      } catch (error) {
        console.error("[LeadsRouter] Error updating lead:", error);
        throw new Error("Falha ao atualizar o lead.");
      }
    }),
});
