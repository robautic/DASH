export function calculateFunnelMetrics(stages: any[], leads: any[]) {
  return stages.map((stage) => {
    const stageLeads = leads.filter((l) => l.stageId === stage.id || l.etapa === stage.name);
    return {
      stageId: stage.id,
      stageName: stage.name,
      count: stageLeads.length,
      percentage: leads.length > 0 ? Math.round((stageLeads.length / leads.length) * 100) : 0,
    };
  });
}
