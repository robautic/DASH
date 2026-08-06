export function calculateConversionRates(leads: any[], businesses: any[]) {
  const total = leads.length || 1;
  const won = leads.filter((l) => l.status === "won" || l.etapa === "Ganho").length;
  const lost = leads.filter((l) => l.status === "lost" || l.etapa === "Perdido").length;
  const inProgress = leads.filter((l) => l.etapa === "Em atendimento").length;

  return {
    total,
    won,
    lost,
    inProgress,
    conversionRate: Math.round((won / total) * 100),
    lossRate: Math.round((lost / total) * 100),
  };
}
