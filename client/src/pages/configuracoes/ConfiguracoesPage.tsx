import { useMonitoringStatus } from '@/features/monitoring/useMonitoringStatus'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

function relativeTime(iso: string | null): string {
  if (!iso) return 'nunca'
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `${minutes} min atrás`
  return `${Math.round(minutes / 60)}h atrás`
}

export function ConfiguracoesPage() {
  const { data, isLoading, isError } = useMonitoringStatus()

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Configurações</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Monitoramento da integração com o DataCrazy e do Firestore. Só ADMIN.
      </p>

      {isLoading && (
        <div className="mt-6 flex justify-center">
          <Spinner />
        </div>
      )}
      {isError && <p className="mt-6 text-[var(--color-danger)]">Dados indisponíveis (essa tela é só pra ADMIN).</p>}

      {data && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Firestore</p>
              <Badge tone="positive" className="mt-2">
                {data.firestore.status}
              </Badge>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">DataCrazy API</p>
              <Badge tone={data.datacrazy.status === 'error' ? 'danger' : 'positive'} className="mt-2">
                {data.datacrazy.status ?? 'nunca sincronizado'}
              </Badge>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">{data.datacrazy.inferredFrom}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Última sincronização</p>
              <p className="mt-2 font-mono-nums text-sm text-[var(--color-text)]">
                {relativeTime(data.sync.lastSuccessfulSync)}
              </p>
            </Card>
          </div>

          <Card>
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Sincronização</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Registros processados</dt>
                <dd className="font-mono-nums text-[var(--color-text)]">{data.sync.recordsProcessed ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Duração</dt>
                <dd className="font-mono-nums text-[var(--color-text)]">
                  {data.sync.duration != null ? `${data.sync.duration}ms` : '—'}
                </dd>
              </div>
              {data.sync.error && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Último erro</dt>
                  <dd className="text-right text-[var(--color-danger)]">{data.sync.error}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Rate limiter (DataCrazy)</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Requisições (desde o último boot)</dt>
                <dd className="font-mono-nums text-[var(--color-text)]">{data.rateLimiter.totalRequests}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">429 recebidos</dt>
                <dd className="font-mono-nums text-[var(--color-text)]">{data.rateLimiter.rateLimited429Count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Falhas após esgotar retry</dt>
                <dd className="font-mono-nums text-[var(--color-text)]">{data.rateLimiter.retryExhaustedCount}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}
    </div>
  )
}
