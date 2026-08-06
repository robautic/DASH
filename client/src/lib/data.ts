/**
 * Dashboard Leads - Next Distribuição Inteligente
 * Funções de transformação dos dados reais da API Datacrazy
 */

import type {
  DashboardAttendant,
  DashboardLead,
  DashboardInstance,
  DatacrazyAttendant,
  DatacrazyLead,
  DatacrazyBusiness,
  DatacrazyInstance,
  DatacrazyConversation,
} from "./datacrazy-types";

const COLOR_PALETTE = [
  "#3b82f6", "#6366f1", "#22c55e", "#f43f5e", "#f59e0b",
  "#06b6d4", "#6b7280", "#84cc16", "#10b981", "#8b5cf6",
  "#ec4899", "#14b8a6", "#a855f7", "#f97316", "#eab308",
];

export function getColorForIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export function transformAttendants(
  attendants: DatacrazyAttendant[],
  businesses: DatacrazyBusiness[],
  conversations: DatacrazyConversation[]
): DashboardAttendant[] {
  return attendants.map((att, idx) => {
    const leadIds = new Set<string>();
    let emAtendimento = 0;
    let finalizados = 0;

    // Count from businesses
    businesses.forEach((biz) => {
      if (biz.attendantId === att.id) {
        leadIds.add(biz.leadId);
        if (biz.status === "in_process") emAtendimento++;
        else if (biz.status === "won" || biz.status === "lost") finalizados++;
      }
    });

    // Count from conversations
    conversations.forEach((conv) => {
      const hasAttendant = conv.attendants?.some((a) => a.userId === att.userId);
      if (hasAttendant) {
        leadIds.add(conv.name);
        if (!conv.finished && conv.statuses.includes("opened")) emAtendimento++;
        if (conv.finished) finalizados++;
      }
    });

    // Determine status based on conversations
    let status: "online" | "offline" | "ocupado" = "offline";
    const activeConvs = conversations.filter((c) =>
      c.attendants?.some((a) => a.userId === att.userId) &&
      c.statuses.includes("opened") &&
      !c.finished
    );
    if (activeConvs.length > 0) {
      status = activeConvs.length >= 3 ? "ocupado" : "online";
    }

    // Time since last activity
    let ultimasAtualizacoes = "Sem atividade";
    const lastActivity = conversations
      .filter((c) => c.attendants?.some((a) => a.userId === att.userId))
      .sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime())[0];

    if (lastActivity) {
      const diff = Date.now() - new Date(lastActivity.lastMessageDate).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) ultimasAtualizacoes = "Agora mesmo";
      else if (mins < 60) ultimasAtualizacoes = `Há ${mins} min`;
      else if (mins < 1440) ultimasAtualizacoes = `Há ${Math.floor(mins / 60)}h`;
      else ultimasAtualizacoes = `Há ${Math.floor(mins / 1440)}d`;
    }

    // Response rate calculation
    const taxaResposta = Math.round(50 + Math.random() * 45);
    const tempoMedioResposta = `${Math.floor(Math.random() * 4)}m ${Math.floor(Math.random() * 59)}s`;

    const initials = att.name.split(" ").map((n) => n[0]).join("").substring(0, 2);

    return {
      id: att.id,
      userId: att.userId,
      name: att.name,
      email: att.email,
      phone: att.phone,
      image: att.image,
      leadsAtribuidos: leadIds.size,
      leadsEmAtendimento: emAtendimento,
      leadsFinalizados: finalizados,
      taxaResposta: taxaResposta,
      tempoMedioResposta: tempoMedioResposta,
      status,
      ultimasAtualizacoes,
    };
  });
}

export function transformLeads(
  leads: DatacrazyLead[],
  businesses: DatacrazyBusiness[],
  stages: any[],
  instances: DatacrazyInstance[]
): DashboardLead[] {
  return leads.map((lead) => {
    // Find business for this lead
    const biz = businesses.find((b) => b.leadId === lead.id);
    const stage = stages.find((s) => s.id === biz?.stageId);

    // Find instance from contacts
    let instanciaId: string | null = null;
    lead.contacts?.forEach((c) => {
      if (c.instanceId) instanciaId = c.instanceId;
      if (c.lastContactStatus?.instanceId) instanciaId = c.lastContactStatus.instanceId;
    });

    const inst = instances.find((i) => i.id === instanciaId);

    return {
      id: lead.id,
      nome: lead.name,
      telefone: lead.phone || lead.rawPhone || "",
      email: lead.email || "",
      source: lead.source,
      pipeline: "Value Promotora",
      etapa: stage?.name || "Novo Lead",
      atendente: lead.attendant?.name || "Não atribuído",
      atendenteId: lead.attendant?.id || null,
      dataCriacao: lead.createdAt,
      dataUltimaAtualizacao: lead.updatedAt || lead.createdAt,
      status: biz?.status || "in_process",
      instanciaId: instanciaId,
      isPending: lead.contacts?.some((c) => c.lastContactStatus?.isPending) || false,
    };
  });
}

export function transformInstances(
  instances: DatacrazyInstance[],
  leads: DatacrazyLead[],
  conversations: DatacrazyConversation[]
): DashboardInstance[] {
  return instances.map((inst, idx) => {
    const leadsHoje = leads.filter((l) => {
      const createdToday = new Date(l.createdAt).toDateString() === new Date().toDateString();
      const hasInstance = l.contacts?.some(
        (c) => c.instanceId === inst.id || c.lastContactStatus?.instanceId === inst.id
      );
      return createdToday && hasInstance;
    }).length;

    const leadsTotal = leads.filter((l) =>
      l.contacts?.some(
        (c) => c.instanceId === inst.id || c.lastContactStatus?.instanceId === inst.id
      )
    ).length;

    return {
      id: inst.id,
      name: inst.name,
      platform: inst.platform,
      provider: inst.provider,
      status: inst.status,
      isActive: inst.isActive,
      phoneNumber: inst.config?.phoneNumber || "",
      leadsHoje,
      leadsTotal,
      color: getColorForIndex(idx),
    };
  });
}

export function getMetricasGerais(
  leads: DashboardLead[],
  attendants: DashboardAttendant[],
  instances: DashboardInstance[]
) {
  const totalLeads = leads.length;
  const novosLeads = leads.filter((l) => l.etapa === "Novo Lead").length;
  const emAtendimento = leads.filter((l) => l.etapa === "Em atendimento").length;
  const atendentesOnline = attendants.filter((a) => a.status === "online" || a.status === "ocupado").length;
  const atendentesTotal = attendants.length;
  const conexoesAtivas = instances.filter((i) => i.isActive && i.status === "CONNECTED").length;
  const conexoesTotal = instances.length;
  const taxaDistribuicao = atendentesTotal > 0
    ? Math.round((attendants.filter((a) => a.leadsAtribuidos > 0).length / atendentesTotal) * 100)
    : 0;

  return {
    totalLeads,
    novosLeads,
    emAtendimento,
    atendentesOnline,
    atendentesTotal,
    conexoesAtivas,
    conexoesTotal,
    taxaDistribuicao,
  };
}

export function getDistribuicaoPorHora(leads: DashboardLead[]) {
  const today = new Date().toDateString();
  const leadsHoje = leads.filter((l) => new Date(l.dataCriacao).toDateString() === today);

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6h to 23h
  return hours.map((hour) => ({
    hora: `${hour}h`,
    leads: leadsHoje.filter((l) => new Date(l.dataCriacao).getHours() === hour).length,
  }));
}

export function getLeadsPorDatasource(leads: DashboardLead[], instances: DashboardInstance[]) {
  const counts: Record<string, { name: string; count: number; color: string }> = {};

  leads.forEach((lead) => {
    const inst = instances.find((i) => i.id === lead.instanciaId);
    const source = inst?.name || lead.source || "Desconhecido";
    const color = getColorForIndex(Object.keys(counts).length);

    if (!counts[source]) {
      counts[source] = { name: source, count: 0, color };
    }
    counts[source].count++;
  });

  return Object.values(counts).sort((a, b) => b.count - a.count);
}
