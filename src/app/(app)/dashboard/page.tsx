import Link from 'next/link'
import { getAppContext } from '@/lib/app-context'
import { FilterBar } from '@/components/filter-bar'
import { DashboardSeries } from '@/components/dashboard-series'
import { UiIcon } from '@/components/ui-icon'
import type { FilterOptions } from '@/lib/domain'

type Recent = {
  conversation_id: string
  contact_name: string | null
  contact_phone: string | null
  last_message_preview: string | null
  last_message_at: string | null
  unread_inbound_count: number
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { supabase, tenantId } = await getAppContext()
  const params = await searchParams
  const value = (key: string) =>
    typeof params[key] === 'string' ? (params[key] as string) : undefined
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 29)
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
  const [summaryRes, filtersRes, seriesRes, recentRes] = await Promise.all([
    supabase.rpc('get_dashboard_summary_filtered', rpcArgs),
    supabase.rpc('get_filter_options', { p_tenant_id: tenantId }),
    supabase.rpc('get_dashboard_daily_series_filtered', {
      ...rpcArgs,
      p_from: from.toISOString().slice(0, 10),
      p_to: to.toISOString().slice(0, 10),
    }),
    supabase.rpc('list_conversations_filtered', {
      p_tenant_id: tenantId,
      p_search: null,
      p_status: null,
      p_source: null,
      p_connection_id: null,
      p_assigned_user_id: null,
      p_pipeline_id: null,
      p_stage_id: null,
      p_tag_id: null,
      p_limit: 5,
      p_offset: 0,
    }),
  ])
  if (summaryRes.error) throw new Error(summaryRes.error.message)
  const s = (summaryRes.data || {}) as Record<string, number | string | boolean>
  const filters = (filtersRes.data || {}) as FilterOptions
  const series = (seriesRes.data || []) as Array<{
    day: string
    conversations: number
    leads: number
    sales: number
    revenue: number
  }>
  const recent = (recentRes.data || []) as Recent[]
  const money = (n: number | string | boolean | undefined) =>
    Number(n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    })
  const leads = Math.max(1, Number(s.leads || 0))
  const pct = (n: number | string | boolean | undefined) =>
    Math.min(100, Math.round((Number(n || 0) / leads) * 100))
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Visão geral</div>
          <h1>Olá, vamos acompanhar sua operação?</h1>
          <p>Últimos 30 dias, com os dados recebidos pelas suas integrações.</p>
        </div>
        <div className="page-actions">
          <span className="premium-pill">
            {from.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}{' '}
            —{' '}
            {to.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      </div>
      <p className="muted">Extensão: os indicadores incluem somente conversas capturadas. Vendas e receita dependem dos registros no pipeline. <Link href="/extensao">Conectar WhatsApp Web →</Link></p>
      <FilterBar options={filters} />
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Conversas</span>
            <span className="metric-arrow">
              <UiIcon name="arrow" size={14} />
            </span>
          </div>
          <div className="metric-value">
            {Number(s.new_conversations || 0).toLocaleString('pt-BR')}
          </div>
          <div className="metric-note">novas no período</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Leads no pipeline</span>
            <span className="metric-arrow">
              <UiIcon name="pipeline" size={14} />
            </span>
          </div>
          <div className="metric-value">
            {Number(s.leads || 0).toLocaleString('pt-BR')}
          </div>
          <div className="metric-note">oportunidades acompanhadas</div>
        </div>
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Vendas</span>
            <span className="metric-arrow">
              <UiIcon name="chart" size={14} />
            </span>
          </div>
          <div className="metric-value">
            {Number(s.sales || 0).toLocaleString('pt-BR')}
          </div>
          <div className="metric-note">
            {Number(s.conversion_rate || 0)}% de conversão
          </div>
        </div>
        <div className="metric-card accent">
          <div className="metric-top">
            <span className="metric-label">Receita</span>
            <span className="metric-arrow">
              <UiIcon name="arrow" size={14} />
            </span>
          </div>
          <div className="metric-value money">{money(s.revenue)}</div>
          <div className="metric-note">
            ticket médio {money(s.average_ticket)}
          </div>
        </div>
      </section>
      <section className="analytics-grid">
        <div className="card analytics-card">
          <div className="card-title-row">
            <div>
              <h3>Ritmo das conversas</h3>
              <div className="card-kicker">
                Volume diário no período selecionado
              </div>
            </div>
            <span className="premium-pill">Conversas</span>
          </div>
          <DashboardSeries data={series} />
        </div>
        <div className="card analytics-card">
          <div className="card-title-row">
            <div>
              <h3>Conversas recentes</h3>
              <div className="card-kicker">Últimos contatos da operação</div>
            </div>
          </div>
          <div className="recent-list">
            {recent.map((c) => (
              <Link
                className="recent-item"
                href={`/conversas?search=${encodeURIComponent(c.contact_phone || c.contact_name || '')}`}
                key={c.conversation_id}
              >
                <div className="recent-avatar">
                  {(c.contact_name || c.contact_phone || '?')
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div className="recent-copy">
                  <strong>
                    {c.contact_name || c.contact_phone || 'Contato'}
                  </strong>
                  <span>
                    {c.last_message_preview || 'Sem mensagem recente'}
                  </span>
                </div>
                <span className="recent-time">
                  {c.last_message_at
                    ? new Date(c.last_message_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </Link>
            ))}
            {!recent.length && (
              <div className="empty">As conversas aparecerão aqui.</div>
            )}
          </div>
        </div>
      </section>
      <section className="dashboard-bottom">
        <div className="card card-pad">
          <div className="card-title-row">
            <div>
              <h3>Funil da operação</h3>
              <div className="card-kicker">Da entrada até a venda</div>
            </div>
          </div>
          <div className="funnel-bars">
            {[
              ['Leads', s.leads, Number(s.leads || 0) > 0 ? 100 : 0],
              ['Interessados', s.interested, pct(s.interested)],
              ['Agendamentos', s.appointments, pct(s.appointments)],
              ['Vendas', s.sales, pct(s.sales)],
            ].map(([label, num, width]) => (
              <div className="funnel-row" key={String(label)}>
                <span>{label}</span>
                <div className="funnel-track">
                  <div
                    className="funnel-fill"
                    style={{ width: `${Number(width)}%` }}
                  />
                </div>
                <b>{Number(num || 0)}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="card insight-card">
          <div className="page-eyebrow">Velocidade</div>
          <h3>Primeira resposta</h3>
          <div className="insight-number">
            {Math.round(Number(s.avg_first_response_seconds || 0) / 60)}m
          </div>
          <div className="insight-label">
            tempo médio para responder uma nova conversa
          </div>
        </div>
      </section>
    </div>
  )
}
