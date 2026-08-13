import { useDashboardKpis } from '@/features/dashboard/useDashboardKpis'
import { useSyncStatus } from '@/features/dashboard/useSyncStatus'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'nunca sincronizado'
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.round(hours / 24)}d atrás`
}

function KpiCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 font-mono-nums text-2xl font-semibold text-[var(--color-text)]">
        {loading ? '—' : value}
      </p>
    </Card>
  )
}

export function DashboardPage() {
  const kpis = useDashboardKpis()
  const sync = useSyncStatus()

  const conversionRateLabel =
    kpis.data?.conversionRate == null ? 'Dados indisponíveis' : `${(kpis.data.conversionRate * 100).toFixed(1)}%`

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Dashboard</h1>
        <SyncBadge status={sync.data?.status ?? null} lastSuccessfulSync={sync.data?.lastSuccessfulSync ?? null} />
      </div>

      {kpis.isError && (
        <p className="mb-4 text-sm text-[var(--color-danger)]">
          Não foi possível carregar os KPIs agora. Dados indisponíveis.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Leads" value={String(kpis.data?.leads ?? 0)} loading={kpis.isLoading} />
        <KpiCard label="Conversões" value={String(kpis.data?.conversions ?? 0)} loading={kpis.isLoading} />
        <KpiCard label="Taxa de conversão" value={conversionRateLabel} loading={kpis.isLoading} />
      </div>

      <p className="mt-6 text-xs text-[var(--color-text-muted)]">
        Gráficos de leads por dia, funil e performance por atendente chegam na Fase 6/7, junto da agregação de
        métricas — por enquanto os números acima já são reais (contados direto no Firestore), sem placeholder.
      </p>
    </div>
  )
}

function SyncBadge({ status, lastSuccessfulSync }: { status: string | null; lastSuccessfulSync: string | null }) {
  const tone = status === 'error' ? 'danger' : status === 'running' ? 'warning' : 'positive'
  return (
    <Badge tone={tone}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Última sincronização: {formatRelativeTime(lastSuccessfulSync)}
    </Badge>
  )
}
