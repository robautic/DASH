import { getAppContext } from '@/lib/app-context'
import { PipelineBoard } from '@/components/pipeline-board'
import type { PipelineRow } from '@/lib/domain'

export default async function PipelinePage() {
  const { supabase, tenantId } = await getAppContext()
  const { data, error } = await supabase.rpc('get_pipeline_board_filtered', {
    p_tenant_id: tenantId, p_pipeline_id: null, p_search: null, p_owner_id: null, p_connection_id: null, p_source: null, p_tag_id: null,
  })
  if (error) throw new Error(error.message)
  const rows = (data || []) as PipelineRow[]
  return <div className="page page-wide"><div className="page-head"><div><h1>Pipeline</h1><p>Arraste os cards entre as etapas. A mudança é salva no Supabase em tempo real.</p></div></div>{rows.length ? <PipelineBoard tenantId={tenantId} rows={rows} /> : <div className="card empty">O pipeline ainda não possui etapas ou oportunidades.</div>}</div>
}
