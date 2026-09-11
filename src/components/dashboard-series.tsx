import { useId } from 'react'
type Point = {
  day: string
  conversations: number
  leads: number
  sales: number
  revenue: number
}
export function DashboardSeries({ data }: { data: Point[] }) {
  const titleId = useId()
  if (!data.length)
    return <div className="empty">Ainda não há dados neste período.</div>
  const w = 720,
    h = 220,
    p = 28,
    max = Math.max(1, ...data.map((x) => Number(x.conversations || 0)))
  const slot = (w - p * 2) / data.length
  const every = Math.max(1, Math.ceil(data.length / 6))
  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={'0 0 ' + w + ' ' + h}
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>
          Conversas por dia.{' '}
          {data
            .map((point) => point.day + ': ' + point.conversations)
            .join('; ')}
        </title>
        {[0, 0.25, 0.5, 0.75, 1].map((n) => (
          <line
            key={n}
            className="chart-gridline"
            x1={p}
            x2={w - p}
            y1={p + (h - p * 2) * n}
            y2={p + (h - p * 2) * n}
          />
        ))}
        {data.map((point, i) => {
          const value = Math.max(0, Number(point.conversations || 0))
          const height = (value / max) * (h - p * 2)
          const x = p + i * slot
          const day = new Date(point.day + 'T12:00:00').toLocaleDateString(
            'pt-BR',
            { day: '2-digit', month: '2-digit' },
          )
          return (
            <g key={point.day}>
              <rect
                className="chart-bar"
                x={x + slot * 0.18}
                y={h - p - height}
                width={slot * 0.64}
                height={height}
                rx={Math.min(8, slot * 0.25)}
                style={{ fill: i === data.length - 1 ? '#d8fa83' : undefined }}
              >
                <title>
                  {day}: {value} conversas
                </title>
              </rect>
              {(i % every === 0 || i === data.length - 1) && (
                <text
                  className="chart-label"
                  x={x + slot / 2}
                  y={h - 5}
                  textAnchor="middle"
                >
                  {day}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
