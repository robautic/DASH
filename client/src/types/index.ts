export type UserRole = "admin" | "supervisor" | "attendant" | "viewer";

export interface LeadFilter {
  search?: string;
  attendant?: string;
  department?: string;
  campaign?: string;
  status?: string;
  origin?: string;
  period?: string;
}

export interface CampaignData {
  id: string;
  name: string;
  channel: string;
  leadsCount: number;
  conversionsCount: number;
  revenue: number;
  cost: number;
  cpc: number;
  cpa: number;
  avgTicket: number;
  roi: number;
}

export interface AgentGoal {
  agentId: string;
  agentName: string;
  targetLeads: number;
  currentLeads: number;
  targetConversions: number;
  currentConversions: number;
}

export interface TimelineEvent {
  id: string;
  type: "created" | "assigned" | "stage_change" | "message" | "note" | "sla_alert";
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
}
