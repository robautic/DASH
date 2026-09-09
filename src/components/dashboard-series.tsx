type Point = { day: string; conversations: number; leads: number; sales: number; revenue: number }

export function DashboardSeries({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((x) => Number(x.conversations || 0)))
  if (!data.length) return <div className="empty">Ainda não há dados neste período.</div>
  return (
    <div className="series" aria-label="Conversas por dia">
      {data.map((x) => (
        <div className="series-col" key={x.day} title={`${x.day}: ${x.conversations} conversas`}>
          <div className="series-bar" style={{ height: `${Math.max(5, (Number(x.conversations) / max) * 150)}px` }} />
          <small>{new Date(`${x.day}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</small>
        </div>
      ))}
    </div>
  )
}
