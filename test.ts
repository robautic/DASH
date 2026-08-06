import { fetchLeads, fetchBusinesses, fetchPipelineStages } from "./server/services/datacrazy/leads";
import { fetchConversations } from "./server/services/datacrazy/conversations";

async function run() {
  const PIPELINE_VALUE_ID = "3922b55e-f151-4fa4-ac85-9f2767272419";
  const b = await fetchBusinesses(0, 1000, { pipelineId: PIPELINE_VALUE_ID });
  const b_all = await fetchBusinesses(0, 1000);
  console.log("Biz with pipeline filter:", b.data.length);
  console.log("Biz without filter:", b_all.data.length);

  const l = await fetchLeads(0, 1000);
  console.log("Leads count:", l.data.length);
}

run().catch(console.error);
