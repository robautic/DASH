import { getAppContext } from '@/lib/app-context'
import { ConnectionsManager } from '@/components/connections-manager'

export default async function ConnectionsPage() {
  const { supabase, tenantId, bootstrap } = await getAppContext()
  const { data, error } = await supabase.rpc('get_connection_health', { p_tenant_id: tenantId })
  if (error) throw new Error(error.message)
  return <div className="page"><div className="page-head"><div><h1>Conexões</h1><p>Conecte o WhatsApp Cloud API e acompanhe a saúde da sincronização.</p></div></div><ConnectionsManager tenantId={tenantId} initial={(data || []) as never[]} canManage={Boolean(bootstrap.permissions?.manage_connections)} /></div>
}
