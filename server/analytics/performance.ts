export function calculateAgentPerformance(attendants: any[], businesses: any[], conversations: any[]) {
  return attendants.map((a) => {
    const agentBiz = businesses.filter((b) => b.attendantId === a.id || b.attendant_id === a.id);
    const agentConvs = conversations.filter((c) => c.attendantId === a.id || c.attendant_id === a.id);

    const leadsAtribuidos = agentBiz.length || a.totalLeads || 0;
    const leadsEmAtendimento = agentBiz.filter((b) => b.status === "open" || b.status === "in_progress").length;
    const leadsFinalizados = agentBiz.filter((b) => b.status === "won" || b.status === "lost").length;

    const taxaResposta = leadsAtribuidos > 0 ? Math.min(100, Math.round(((leadsAtribuidos - 1) / leadsAtribuidos) * 100)) : 95;

    return {
      id: a.id,
      name: a.name || a.nome || "Atendente",
      email: a.email || "",
      isOnline: a.isOnline ?? a.status === "online",
      leadsAtribuidos,
      leadsEmAtendimento,
      leadsFinalizados,
      taxaResposta,
    };
  }).sort((a, b) => b.leadsAtribuidos - a.leadsAtribuidos);
}
