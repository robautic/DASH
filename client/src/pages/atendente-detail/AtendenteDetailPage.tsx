import { Link, useParams } from 'react-router-dom'
import { useAttendantPerformance } from '@/features/attendants/useAttendantsPerformance'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

export function AtendenteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useAttendantPerformance(id)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <Link to="/atendentes" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Voltar para atendentes
        </Link>
        <p className="mt-4 text-[var(--color-danger)]">Dados indisponíveis.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link to="/atendentes" className="text-sm text-[var(--color-accent)] hover:underline">
        ← Voltar para atendentes
      </Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-[var(--color-text)]">{data.name}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Meus leads</p>
          <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--color-text)]">{data.leads}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Minhas conversões</p>
          <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--color-text)]">{data.conversions}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Taxa de conversão</p>
          <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--color-text)]">
            {data.conversionRate == null ? '—' : `${(data.conversionRate * 100).toFixed(1)}%`}
          </p>
        </Card>
      </div>

      <p className="mt-6 text-xs text-[var(--color-text-muted)]">
        Minha meta e meu ranking aparecem aqui quando metas (Fase 7) e o cálculo de ranking existirem.
      </p>
    </div>
  )
}
