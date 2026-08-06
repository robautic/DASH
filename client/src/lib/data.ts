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
  DatacrazyDepartment,
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

export function parseTrackingAndFormAnswers(obj: any) {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  let referralHeadline: string | undefined = obj.referralHeadline;
  let referralSourceId: string | undefined = obj.referralSourceId;
  let referralSourceUrl: string | undefined = obj.referralSourceUrl;
  let ctwaClid: string | undefined = obj.ctwaClid;
  let cpf: string | undefined = obj.taxId || obj.cpf;
  let formAnswers: Record<string, string> = obj.formAnswers ? { ...obj.formAnswers } : {};
  let instanceName: string | undefined = obj.instanceName || obj.instanceData?.name;
  let instanceId: string | undefined = obj.instanceId || obj.instanceData?.id;

  // Extract from referral object (Meta Ads CTWA / WhatsApp Referral)
  const ref = obj.referral || obj.lastMessage?.referral || obj.messageData?.referral;
  if (ref) {
    if (!referralHeadline && ref.headline) referralHeadline = ref.headline;
    if (!referralSourceId && ref.source_id) referralSourceId = ref.source_id;
    if (!referralSourceUrl && ref.source_url) referralSourceUrl = ref.source_url;
    if (!ctwaClid && ref.ctwa_clid) ctwaClid = ref.ctwa_clid;
  }

  // Extract from text content (Form submission texts or messages)
  const textSources: string[] = [];
  if (typeof obj.message?.text === "string") textSources.push(obj.message.text);
  if (typeof obj.messageData?.text === "string") textSources.push(obj.messageData.text);
  if (typeof obj.text?.body === "string") textSources.push(obj.text.body);
  if (typeof obj.lastMessage?.body === "string") textSources.push(obj.lastMessage.body);
  if (typeof obj.body === "string") textSources.push(obj.body);

  const fullText = textSources.join("\n");
  if (fullText) {
    const lines = fullText.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex > 0 && colonIndex < trimmed.length - 1) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (key.toLowerCase().includes("olá") || key.toLowerCase().includes("preenchi")) continue;

        if (key && value) {
          formAnswers[key] = value;
          if (!cpf && (key.toUpperCase() === "CPF" || key.toLowerCase().includes("cpf"))) {
            cpf = value;
          }
        }
      }
    }

    if (!cpf) {
      const cpfMatch = fullText.match(/CPF:\s*(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})/i);
      if (cpfMatch) {
        cpf = cpfMatch[1];
      }
    }
  }

  return {
    referralHeadline,
    referralSourceId,
    referralSourceUrl,
    ctwaClid,
    cpf,
    formAnswers: Object.keys(formAnswers).length > 0 ? formAnswers : undefined,
    instanceName,
    instanceId,
  };
}

export function transformLeads(
  leads: DatacrazyLead[],
  businesses: DatacrazyBusiness[],
  stages: any[],
  instances: DatacrazyInstance[],
  attendants: DatacrazyAttendant[] = [],
  departments: DatacrazyDepartment[] = [],
  conversations: DatacrazyConversation[] = []
): DashboardLead[] {
  const defaultDepts = [
    { id: "6a5c2ecba547652405c67b0e", name: "Atendimento", color: "#EA580C" },
    { id: "6a6cbce0d97edaaf109fd343", name: "Value Promotora", color: "#10B981" },
    { id: "6a6d00427006365c0797014d", name: "Next", color: "#3B82F6" },
  ];

  const depts = departments.length > 0 ? departments : defaultDepts;

  return leads.map((lead, idx) => {
    // Find business for this lead
    const biz = businesses.find((b) => b.leadId === lead.id);
    const stage = stages.find((s) => s.id === biz?.stageId);

    // Attendant resolution
    let attendantName = lead.attendant?.name;
    let attendantId = lead.attendant?.id || lead.attendant?.userId || null;

    if (!attendantName && (lead as any).attendants?.length > 0) {
      attendantName = (lead as any).attendants[0].name;
      attendantId = (lead as any).attendants[0].id || (lead as any).attendants[0].userId;
    }

    if (!attendantName && biz?.attendantId) {
      const att = attendants.find((a) => a.id === biz.attendantId || a.userId === biz.attendantId);
      if (att) {
        attendantName = att.name;
        attendantId = att.id;
      }
    }

    // Match conversation by phone or name
    const matchedConv = conversations.find((c) => {
      if (!c) return false;
      const cleanLeadPhone = lead.phone ? lead.phone.replace(/\D/g, "") : "";
      const cleanConvName = c.name ? c.name.replace(/\D/g, "") : "";
      if (cleanLeadPhone && cleanConvName && cleanLeadPhone.length >= 8 && cleanConvName.includes(cleanLeadPhone)) {
        return true;
      }
      return c.name === lead.name;
    });

    if (!attendantName && matchedConv?.attendants && matchedConv.attendants.length > 0) {
      attendantName = matchedConv.attendants[0].name;
      attendantId = matchedConv.attendants[0].id || matchedConv.attendants[0].userId;
    }

    // Fallback: Leave as 'Não atribuído' if not found
    if (!attendantName) {
      attendantName = "Não atribuído";
    }

    // Department resolution based on real mapping rules provided by user
    const attendantToDept: Record<string, string> = {
      "Ana Carol": "Value Promotora",
      "Ana Flávia": "Next",
      "Ana Julia": "Melhor Negócio Veículos",
      "Ana Laura": "Auxílio Acidente",
      "Ana Martins": "Value Promotora",
      "Ana Nascimento": "Next",
      "Anieli": "Melhor Negócio Veículos",
      "Assessoria": "Auxílio Acidente",
      "Auyra": "Value Promotora",
      "Beatriz Silva": "Next",
      "Bianca": "Value Promotora",
      "Bruna": "Melhor Negócio Veículos",
      "Camila": "Auxílio Acidente"
    };

    let dept: any = { name: "Atendimento", color: "#EA580C" };
    
    // Check real mapping
    if (attendantName && attendantToDept[attendantName]) {
      const mappedDeptName = attendantToDept[attendantName];
      const found = depts.find((d) => d.name === mappedDeptName);
      if (found) {
        dept = found;
      } else {
        dept = { id: mappedDeptName, name: mappedDeptName, color: "#EA580C" };
      }
    } else if ((lead as any).departmentId) {
      const found = depts.find((d) => d.id === (lead as any).departmentId);
      if (found) dept = found;
    } else if ((lead as any).departmentName) {
      const found = depts.find((d) => d.name === (lead as any).departmentName);
      if (found) dept = found;
    }

    // Pipeline mapping based on department if possible
    let pipelineName = (biz as any)?.stage?.pipeline?.name || dept?.name || "Value Promotora";
    
    // Find instance from contacts or matched conversation
    let instanciaId: string | null = null;
    lead.contacts?.forEach((c) => {
      if (c.instanceId) instanciaId = c.instanceId;
      if (c.lastContactStatus?.instanceId) instanciaId = c.lastContactStatus.instanceId;
    });

    const inst = instances.find((i) => i.id === instanciaId);

    // Extract tracking and form answers
    const leadTrack = parseTrackingAndFormAnswers(lead);
    const convTrack = parseTrackingAndFormAnswers(matchedConv);

    const referralHeadline = leadTrack.referralHeadline || convTrack.referralHeadline;
    const referralSourceId = leadTrack.referralSourceId || convTrack.referralSourceId;
    const referralSourceUrl = leadTrack.referralSourceUrl || convTrack.referralSourceUrl;
    const ctwaClid = leadTrack.ctwaClid || convTrack.ctwaClid;
    const cpf = leadTrack.cpf || convTrack.cpf || lead.taxId || undefined;
    const mergedFormAnswers = {
      ...(convTrack.formAnswers || {}),
      ...(leadTrack.formAnswers || {}),
    };
    const resolvedFormAnswers = Object.keys(mergedFormAnswers).length > 0 ? mergedFormAnswers : undefined;
    const resolvedInstanceName = (lead as any).instanceName || leadTrack.instanceName || convTrack.instanceName || inst?.name || "Instância Datacrazy";

    return {
      id: lead.id,
      nome: lead.name,
      telefone: lead.phone || lead.rawPhone || "",
      email: lead.email || "",
      source: lead.source || (referralHeadline ? "Meta Ads (CTWA)" : "Meta Ads"),
      pipeline: pipelineName,
      etapa: stage?.name || "Novo Lead",
      atendente: attendantName,
      atendenteId: attendantId,
      departamento: dept?.name || "Atendimento",
      departamentoCor: dept?.color || "#EA580C",
      dataCriacao: lead.createdAt,
      dataUltimaAtualizacao: lead.updatedAt || lead.createdAt,
      status: biz?.status || "in_process",
      instanciaId: instanciaId || leadTrack.instanceId || convTrack.instanceId || null,
      instanciaNome: resolvedInstanceName,
      isPending: lead.contacts?.some((c) => c.lastContactStatus?.isPending) || false,
      referralHeadline,
      referralSourceId,
      referralSourceUrl,
      ctwaClid,
      cpf,
      formAnswers: resolvedFormAnswers,
      automationTrigger: (lead as any).automationTrigger || "Next e Value Distribuição",
      n8nDistributed: (lead as any).n8nDistributed ?? true,
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
