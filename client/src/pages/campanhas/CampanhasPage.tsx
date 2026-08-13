import { useCampaigns } from '@/features/campaigns/useCampaigns'
import { Spinner } from '@/components/ui/Spinner'

const UNAVAILABLE = <span className="text-[var(--color-text-muted)]">Dados indisponíveis</span>

export function CampanhasPage() {
  const { data, isLoading, isError } = useCampaigns()

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Campanhas</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Leads/conversões vêm de dado real do DataCrazy. Investimento, CPA, receita e ROI dependem de uma fonte de
        custo/receita que o LeadDash ainda não integra.
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Campanha</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Conversões</th>
              <th className="px-4 py-3 font-medium">Taxa</th>
              <th className="px-4 py-3 font-medium">Investimento</th>
              <th className="px-4 py-3 font-medium">CPA</th>
              <th className="px-4 py-3 font-medium">Receita</th>
              <th className="px-4 py-3 font-medium">ROI</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-danger)]">
                  Dados indisponíveis.
                </td>
              </tr>
            )}
            {data?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  Nenhuma campanha identificada nos leads ainda.
                </td>
              </tr>
            )}
            {data?.map((c) => (
              <tr key={c.campaignId} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface)]">
                <td className="px-4 py-3">{c.campaignId}</td>
                <td className="px-4 py-3 font-mono-nums">{c.leads}</td>
                <td className="px-4 py-3 font-mono-nums">{c.conversions}</td>
                <td className="px-4 py-3 font-mono-nums">
                  {c.conversionRate == null ? UNAVAILABLE : `${(c.conversionRate * 100).toFixed(1)}%`}
                </td>
                <td className="px-4 py-3">{UNAVAILABLE}</td>
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
