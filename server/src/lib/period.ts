// Converte um período "YYYY-MM" num intervalo de datas ISO — usado pra
// calcular o progresso de uma meta (Fase 7) e pelos relatórios por período.
export function parsePeriod(period: string): { start: string; end: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(period)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return null

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start: start.toISOString(), end: end.toISOString() }
}
