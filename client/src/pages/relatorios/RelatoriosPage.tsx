import { useState } from 'react'
import { useReportsSummary } from '@/features/reports/useReportsSummary'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function firstDayOfMonthIso() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export function RelatoriosPage() {
  const [from, setFrom] = useState(firstDayOfMonthIso())
  const [to, setTo] = useState(todayIso())
  const [appliedRange, setAppliedRange] = useState({ from: firstDayOfMonthIso(), to: todayIso() })
  const { data, isLoading, isError } = useReportsSummary(appliedRange.from, appliedRange.to)

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Relatórios</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Resumo de leads e conversões reais no período escolhido, dentro do seu escopo.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">De</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Até</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button onClick={() => setAppliedRange({ from, to })}>Aplicar</Button>
      </div>

      {isLoading && <p className="mt-6 text-[var(--color-text-muted)]">Carregando…</p>}
      {isError && <p className="mt-6 text-[var(--color-danger)]">Dados indisponíveis.</p>}

      {data && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Leads</p>
            <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--color-text)]">{data.leads}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Conversões</p>
            <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--color-text)]">
              {data.conversions}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Taxa</p>
            <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--color-text)]">
              {data.conversionRate == null ? '—' : `${(data.conversionRate * 100).toFixed(1)}%`}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
