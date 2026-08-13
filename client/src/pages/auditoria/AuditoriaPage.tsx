import { useAuditLogs } from '@/features/auditLogs/useAuditLogs'
import { Spinner } from '@/components/ui/Spinner'

export function AuditoriaPage() {
  const { data, isLoading, isError } = useAuditLogs()

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Auditoria</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Últimas 50 ações auditadas no sistema.</p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Quando</th>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Ação</th>
              <th className="px-4 py-3 font-medium">Entidade</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-danger)]">
                  Dados indisponíveis (essa tela é só pra ADMIN).
                </td>
              </tr>
            )}
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  Nenhuma ação registrada ainda.
                </td>
              </tr>
            )}
            {data?.map((entry, i) => (
              <tr key={i} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-mono-nums text-[var(--color-text-muted)]">
                  {new Date(entry.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 font-mono-nums text-xs">{entry.userId}</td>
                <td className="px-4 py-3">{entry.action}</td>
                <td className="px-4 py-3 font-mono-nums text-xs text-[var(--color-text-muted)]">
                  {entry.entity}/{entry.entityId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
