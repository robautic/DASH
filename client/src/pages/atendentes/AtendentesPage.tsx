import { Link } from 'react-router-dom'
import { useAttendantsPerformance } from '@/features/attendants/useAttendantsPerformance'
import { Spinner } from '@/components/ui/Spinner'

const UNAVAILABLE = <span className="text-[var(--color-text-muted)]">Dados indisponíveis</span>

export function AtendentesPage() {
  const { data, isLoading, isError } = useAttendantsPerformance()

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Atendentes</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Leads e conversões são contagens reais. Tempo médio, SLA e meta ficam disponíveis quando as métricas
        agregadas (Fase 7) e as metas (Fase 7) existirem.
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Atendente</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Conversões</th>
              <th className="px-4 py-3 font-medium">Taxa de conversão</th>
              <th className="px-4 py-3 font-medium">Tempo médio</th>
              <th className="px-4 py-3 font-medium">SLA</th>
              <th className="px-4 py-3 font-medium">Meta</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-danger)]">
                  Dados indisponíveis.
                </td>
              </tr>
            )}
            {data?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  Nenhum atendente no seu escopo.
                </td>
              </tr>
            )}
            {data?.map((a) => (
              <tr
                key={a.attendantId}
                className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]"
              >
                <td className="px-4 py-3">
                  <Link to={`/atendentes/${a.attendantId}`} className="text-[var(--color-accent)] hover:underline">
                    {a.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono-nums">{a.leads}</td>
                <td className="px-4 py-3 font-mono-nums">{a.conversions}</td>
                <td className="px-4 py-3 font-mono-nums">
                  {a.conversionRate == null ? UNAVAILABLE : `${(a.conversionRate * 100).toFixed(1)}%`}
                </td>
                <td className="px-4 py-3">{UNAVAILABLE}</td>
                <td className="px-4 py-3">{UNAVAILABLE}</td>
                <td className="px-4 py-3">{UNAVAILABLE}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
