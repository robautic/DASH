import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAttendants, useDepartments, useLeads } from '@/features/leads/useLeads'
import type { LeadFilters } from '@/features/leads/types'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

function statusTone(conversionStatus: string | null): 'positive' | 'warning' | 'neutral' {
  if (conversionStatus === 'CONVERTED') return 'positive'
  if (conversionStatus === 'LOST') return 'neutral'
  return 'warning'
}

export function LeadsPage() {
  const [filters, setFilters] = useState<LeadFilters>({})
  const leads = useLeads(filters)
  const attendants = useAttendants()
  const departments = useDepartments()

  const attendantName = (id: string | null) => attendants.data?.find((a) => a.id === id)?.name ?? (id ?? '—')
  const departmentName = (id: string | null) => departments.data?.find((d) => d.id === id)?.name ?? (id ?? '—')

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Leads</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Select
          className="w-48"
          value={filters.attendantId ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, attendantId: e.target.value || undefined }))}
        >
          <option value="">Todos os atendentes</option>
          {attendants.data?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select
          className="w-48"
          value={filters.departmentId ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, departmentId: e.target.value || undefined }))}
        >
          <option value="">Todos os departamentos</option>
          {departments.data?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Atendente</th>
              <th className="px-4 py-3 font-medium">Departamento</th>
              <th className="px-4 py-3 font-medium">Origem</th>
              <th className="px-4 py-3 font-medium">Última interação</th>
              <th className="px-4 py-3 font-medium">Conversão</th>
            </tr>
          </thead>
          <tbody>
            {leads.isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            )}
            {leads.isError && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-danger)]">
                  Dados indisponíveis.
                </td>
              </tr>
            )}
            {leads.data?.data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  Nenhum lead encontrado com esses filtros.
                </td>
              </tr>
            )}
            {leads.data?.data.map((lead) => (
              <tr key={lead.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]">
                <td className="px-4 py-3">
                  <Link to={`/leads/${lead.id}`} className="text-[var(--color-accent)] hover:underline">
                    {lead.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono-nums text-[var(--color-text-muted)]">{lead.phone ?? '—'}</td>
                <td className="px-4 py-3">{attendantName(lead.attendantId)}</td>
                <td className="px-4 py-3">{departmentName(lead.departmentId)}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{lead.source ?? '—'}</td>
                <td className="px-4 py-3 font-mono-nums text-[var(--color-text-muted)]">
                  {lead.lastInteractionAt ? new Date(lead.lastInteractionAt).toLocaleString('pt-BR') : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(lead.conversionStatus)}>{lead.conversionStatus ?? 'EM ABERTO'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
