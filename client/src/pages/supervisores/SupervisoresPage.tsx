import { useTeamOverview } from '@/features/team/useTeamOverview'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

// Mostra a equipe/departamento autorizado do usuário logado — pra
// SUPERVISOR é o próprio departamento; pra ADMIN/VIEWER é a base inteira
// (o backend já aplica o escopo certo em GET /api/team/overview).
export function SupervisoresPage() {
  const { data, isLoading, isError } = useTeamOverview()

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Supervisores</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Visão da equipe dentro do seu escopo autorizado.
      </p>

      {isLoading && (
        <div className="mt-6 flex justify-center">
          <Spinner />
        </div>
      )}
      {isError && <p className="mt-6 text-[var(--color-danger)]">Dados indisponíveis.</p>}

      {data && (
        <>
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

          <h2 className="mt-8 font-display text-lg font-semibold text-[var(--color-text)]">
            Ranking de atendentes
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Atendente</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">Conversões</th>
                  <th className="px-4 py-3 font-medium">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {data.attendants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                      Nenhum atendente no seu escopo.
                    </td>
                  </tr>
                )}
                {data.attendants.map((a, i) => (
                  <tr
                    key={a.attendantId}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                  >
                    <td className="px-4 py-3 font-mono-nums text-[var(--color-text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3">{a.name}</td>
                    <td className="px-4 py-3 font-mono-nums">{a.leads}</td>
                    <td className="px-4 py-3 font-mono-nums">{a.conversions}</td>
                    <td className="px-4 py-3 font-mono-nums">
                      {a.conversionRate == null ? '—' : `${(a.conversionRate * 100).toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
