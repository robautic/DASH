import Link from 'next/link'
import { getAppContext } from '@/lib/app-context'
import { ConnectionsManager } from '@/components/connections-manager'

export default async function ConnectionsPage() {
  const { supabase, tenantId, bootstrap } = await getAppContext()
  const { data, error } = await supabase.rpc('get_connection_health_v2', { p_tenant_id: tenantId })

  if (error) throw new Error(error.message)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Conexões</h1>
          <p>Use Coexistência para manter o WhatsApp Business no celular ou conecte um número dedicado à Cloud API.</p>
        </div>
        {bootstrap.permissions?.manage_connections && (
          <Link className="btn btn-secondary" href="/configuracoes/modelos">Gerenciar modelos</Link>
        )}
      </div>
      <ConnectionsManager
        tenantId={tenantId}
        initial={(data || []) as never[]}
        canManage={Boolean(bootstrap.permissions?.manage_connections)}
      />
    </div>
  )
}
