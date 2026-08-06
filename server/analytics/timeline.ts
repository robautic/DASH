export function calculateHourlyDistribution(leads: any[]) {
  const horas = Array.from({ length: 24 }, (_, i) => ({
    hora: `${i.toString().padStart(2, "0")}:00`,
    leads: 0,
  }));

  for (const lead of leads) {
    if (!lead.createdAt && !lead.dataCriacao) continue;
    const date = new Date(lead.createdAt || lead.dataCriacao);
    if (!isNaN(date.getTime())) {
      const h = date.getHours();
      if (horas[h]) {
        horas[h].leads += 1;
      }
    }
  }

  return horas;
}
