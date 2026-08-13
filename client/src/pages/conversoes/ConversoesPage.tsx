import { useFunnel } from '@/features/conversions/useFunnel'
import { Spinner } from '@/components/ui/Spinner'

interface Stage {
  label: string
  value: number | null
}

function FunnelBar({ stage, maxValue }: { stage: Stage; maxValue: number }) {
  const isAvailable = stage.value != null
  const widthPct = isAvailable && maxValue > 0 ? Math.max((stage.value! / maxValue) * 100, 4) : 100

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-[var(--color-text)]">{stage.label}</span>
        <span className="font-mono-nums text-[var(--color-text-muted)]">
          {isAvailable ? stage.value : 'Dados indisponíveis'}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
        <div
          className={isAvailable ? 'h-full rounded-full bg-[var(--color-accent)]' : 'h-full rounded-full bg-[var(--color-border)]'}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  )
}

export function ConversoesPage() {
  const { data, isLoading, isError } = useFunnel()

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Conversões</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Qualificados e Oportunidades dependem de como o pipeline está configurado no DataCrazy — ficam
        indisponíveis até essa etapa ser mapeada.
      </p>

      {isLoading && (
        <div className="mt-6 flex justify-center">
          <Spinner />
        </div>
      )}
      {isError && <p className="mt-6 text-[var(--color-danger)]">Dados indisponíveis.</p>}

      {data && (
        <div className="mt-6 max-w-xl space-y-4">
          <FunnelBar stage={{ label: 'Leads', value: data.leads }} maxValue={data.leads} />
          <FunnelBar stage={{ label: 'Atendidos', value: data.atendidos }} maxValue={data.leads} />
          <FunnelBar stage={{ label: 'Qualificados', value: data.qualificados }} maxValue={data.leads} />
          <FunnelBar stage={{ label: 'Oportunidades', value: data.oportunidades }} maxValue={data.leads} />
          <FunnelBar stage={{ label: 'Conversões', value: data.conversoes }} maxValue={data.leads} />
        </div>
      )}
    </div>
  )
}
