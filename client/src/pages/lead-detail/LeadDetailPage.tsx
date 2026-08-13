import { Link, useParams } from 'react-router-dom'
import { useLead } from '@/features/leads/useLeads'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

const HISTORY_LABELS: Record<string, string> = {
  ASSIGNED: 'Atribuído',
  TRANSFERRED: 'Transferido',
  STATUS_CHANGED: 'Status alterado',
  TAG_ADDED: 'Tag adicionada',
  TAG_REMOVED: 'Tag removida',
  CONVERTED: 'Convertido',
  CLOSED: 'Encerrado',
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useLead(id)

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
        <Link to="/leads" className="text-sm text-[var(--color-accent)] hover:underline">
          ← Voltar para leads
        </Link>
        <p className="mt-4 text-[var(--color-danger)]">Dados indisponíveis.</p>
      </div>
    )
  }

  const { lead, history } = data

  return (
    <div className="p-6">
      <Link to="/leads" className="text-sm text-[var(--color-accent)] hover:underline">
        ← Voltar para leads
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">{lead.name}</h1>
        <Badge tone={lead.conversionStatus === 'CONVERTED' ? 'positive' : 'warning'}>
          {lead.conversionStatus ?? 'EM ABERTO'}
        </Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Dados do lead</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Telefone" value={lead.phone} mono />
            <Row label="E-mail" value={lead.email} />
            <Row label="Origem" value={lead.source} />
            <Row label="Atendente" value={lead.attendantId} mono />
            <Row label="Departamento" value={lead.departmentId} mono />
            <Row label="Pipeline / Etapa" value={[lead.pipelineId, lead.stageId].filter(Boolean).join(' / ') || null} mono />
            <Row label="Tags" value={lead.tags.length ? lead.tags.join(', ') : null} />
            <Row label="Criado em" value={new Date(lead.createdAt).toLocaleString('pt-BR')} mono />
          </dl>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Histórico</p>
          {history.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {history.map((entry, i) => (
                <li key={i} className="border-l-2 border-[var(--color-accent-muted)] pl-3 text-sm">
                  <p className="text-[var(--color-text)]">{HISTORY_LABELS[entry.type] ?? entry.type}</p>
                  {(entry.from || entry.to) && (
                    <p className="font-mono-nums text-xs text-[var(--color-text-muted)]">
                      {entry.from ?? '—'} → {entry.to ?? '—'}
                    </p>
                  )}
                  <p className="font-mono-nums text-xs text-[var(--color-text-muted)]">
                    {new Date(entry.createdAt).toLocaleString('pt-BR')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className={mono ? 'font-mono-nums text-right text-[var(--color-text)]' : 'text-right text-[var(--color-text)]'}>
        {value ?? '—'}
      </dd>
    </div>
  )
}
