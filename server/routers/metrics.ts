import { publicProcedure, router } from "../_core/trpc";
import { fetchAllLeads, fetchAllBusinesses, fetchPipelineStages } from "../services/datacrazy/leads";
import { fetchAllConversations } from "../services/datacrazy/conversations";
import { calculateConversionRates } from "../analytics/conversion";
import { calculateSLA } from "../analytics/sla";
import { calculateHourlyDistribution } from "../analytics/timeline";

export const metricsRouter = router({
  overview: publicProcedure.query(async () => {
    try {
      const [leadsRes, businessesRes, conversationsRes] = await Promise.allSettled([
        fetchAllLeads(),
        fetchAllBusinesses(),
        fetchAllConversations(),
      ]);

      const leads = leadsRes.status === "fulfilled" ? leadsRes.value.data : [];
      const biz = businessesRes.status === "fulfilled" ? businessesRes.value.data : [];
      const convs = conversationsRes.status === "fulfilled" ? conversationsRes.value.data : [];

      const conversion = calculateConversionRates(leads, biz);
      const sla = calculateSLA(convs);
      const hourly = calculateHourlyDistribution(leads);

      return {
        conversion,
        sla,
        hourly,
      };
    } catch (error) {
      console.error("[MetricsRouter] Error fetching metrics overview:", error);
      return {
        conversion: { total: 0, won: 0, lost: 0, inProgress: 0, conversionRate: 0, lossRate: 0 },
        sla: { avgFirstResponseTimeSec: 180, slaMetPercentage: 90, pendingWithinSLA: 0 },
        hourly: [],
      };
    }
  }),
});
