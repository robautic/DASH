import { getAppContext } from '@/lib/app-context'
import { FilterBar } from '@/components/filter-bar'
import { DashboardSeries } from '@/components/dashboard-series'
import type { FilterOptions } from '@/lib/domain'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, tenantId } = await getAppContext()
  const params = await searchParams
  const value = (key: string) => typeof params[key] === 'string' ? params[key] as string : undefined
  const to = new Date()
  const from = new Date(to); from.setDate(from.getDate() - 29)
  const rpcArgs = {
    p_tenant_id: tenantId,
    p_from: from.toISOString(),
    p_to: new Date(to.getTime() + 86400000).toISOString(),
    p_source: value('source') || null,
    p_connection_id: value('connection') || null,
    p_owner_id: value('owner') || null,
    p_pipeline_id: value('pipeline') || null,
    p_stage_id: value('stage') || null,
    p_tag_id: value('tag') || null,
  }

  const [summaryRes, filtersRes, seriesRes] = await Promise.all([
    supabase.rpc('get_dashboard_summary_filtered', rpcArgs),
    supabase.rpc('get_filter_options', { p_tenant_id: tenantId }),
    supabase.rpc('get_dashboard_daily_series_filtered', { ...rpcArgs, p_from: from.toISOString().slice(0,10), p_to: to.toISOString().slice(0,10) }),
  ])
  if (summaryRes.error) throw new Error(summaryRes.error.message)
  const s = (summaryRes.data || {}) as Record<string, number | string | boolean>
  const filters = (filtersRes.data || {}) as FilterOptions
  const series = (seriesRes.data || []) as Array<{ day: string; conversations: number; leads: number; sales: number; revenue: number }>
  const money = (n: number | string | boolean | undefined) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return <div className="page">
    <div className="page-head"><div><h1>Dashboard</h1><p>Visão dos últimos 30 dias da sua operação.</p></div></div>
    <FilterBar options={filters} />
    <section className="kpi-grid">
      <div className="card kpi"><div className="label">Novas conversas</div><div className="value">{Number(s.new_conversations || 0)}</div><div className="hint">entraram no período</div></div>
      <div className="card kpi"><div className="label">Leads no pipeline</div><div className="value">{Number(s.leads || 0)}</div><div className="hint">novas oportunidades</div></div>
      <div className="card kpi"><div className="label">Vendas</div><div className="value">{Number(s.sales || 0)}</div><div className="hint">{Number(s.conversion_rate || 0)}% conversão</div></div>
      <div className="card kpi"><div className="label">Receita</div><div className="value value-money">{money(s.revenue)}</div><div className="hint">ticket médio {money(s.average_ticket)}</div></div>
      <div className="card kpi"><div className="label">Interessados</div><div className="value">{Number(s.interested || 0)}</div></div>
      <div className="card kpi"><div className="label">Agendamentos</div><div className="value">{Number(s.appointments || 0)}</div></div>
      <div className="card kpi"><div className="label">1ª resposta</div><div className="value">{Math.round(Number(s.avg_first_response_seconds || 0) / 60)}m</div><div className="hint">tempo médio</div></div>
      <div className="card kpi"><div className="label">Ticket médio</div><div className="value value-money">{money(s.average_ticket)}</div></div>
    </section>
    <section className="grid-2">
      <div className="card card-pad"><h3>Conversas por dia</h3><DashboardSeries data={series} /></div>
      <div className="card card-pad"><h3>Funil rápido</h3><div className="mini-funnel"><div><span>Leads</span><b>{Number(s.leads || 0)}</b></div><div><span>Interessados</span><b>{Number(s.interested || 0)}</b></div><div><span>Agendamentos</span><b>{Number(s.appointments || 0)}</b></div><div><span>Vendas</span><b>{Number(s.sales || 0)}</b></div></div></div>
    </section>
  </div>
}
