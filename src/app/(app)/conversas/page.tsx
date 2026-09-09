import { getAppContext } from '@/lib/app-context'
import { ConversationsWorkspace } from '@/components/conversations-workspace'

export default async function ConversationsPage() {
  const { supabase, tenantId } = await getAppContext()
  const [conversations, members, tags] = await Promise.all([
    supabase.rpc('list_conversations_filtered', { p_tenant_id: tenantId, p_search: null, p_status: null, p_source: null, p_connection_id: null, p_assigned_user_id: null, p_pipeline_id: null, p_stage_id: null, p_tag_id: null, p_limit: 60, p_offset: 0 }),
    supabase.rpc('get_workspace_members', { p_tenant_id: tenantId }),
    supabase.rpc('list_tags', { p_tenant_id: tenantId }),
  ])
  if (conversations.error) throw new Error(conversations.error.message)
  return <div className="page page-conversations"><div className="page-head"><div><h1>Conversas</h1><p>Atenda o WhatsApp, atribua responsáveis e organize por tags.</p></div></div><ConversationsWorkspace tenantId={tenantId} initial={(conversations.data || []) as never[]} members={(members.data || []) as never[]} availableTags={(tags.data || []) as never[]} /></div>
}
