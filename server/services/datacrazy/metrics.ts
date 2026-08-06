import { fetchAllLeads, fetchAllBusinesses } from "./leads";
import { fetchAttendants } from "./agents";
import { fetchAllConversations } from "./conversations";

export async function fetchRawMetrics() {
  const [leadsRes, attendantsRes, conversationsRes] = await Promise.allSettled([
    fetchAllLeads(),
    fetchAttendants(),
    fetchAllConversations(),
  ]);

  const leads = leadsRes.status === "fulfilled" ? leadsRes.value.data : [];
  const attendants = attendantsRes.status === "fulfilled" ? attendantsRes.value.data : [];
  const conversations = conversationsRes.status === "fulfilled" ? conversationsRes.value.data : [];

  return {
    totalLeads: leads.length,
    totalAttendants: attendants.length,
    onlineAttendants: attendants.filter((a: any) => a.status === "online" || a.isOnline).length,
    totalConversations: conversations.length,
  };
}
