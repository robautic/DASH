import Link from 'next/link'
import { getAppContext } from '@/lib/app-context'
import { WhatsAppTemplatesManager } from '@/components/whatsapp-templates-manager'

type Connection = {
  id: string
  display_name: string | null
  phone_number: string | null
}

export default async function WhatsAppTemplatesPage() {
  const { supabase, tenantId, bootstrap } = await getAppContext()

  if (!bootstrap.permissions?.manage_connections) {
    return (
      <div className="page">
        <div className="page-head"><div><h1>Modelos do WhatsApp</h1><p>Somente administradores podem gerenciar modelos.</p></div></div>
        <div className="card card-pad"><div className="empty">Você não tem permissão para gerenciar esta integração.</div></div>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('connections')
    .select('id,display_name,phone_number')
    .eq('tenant_id', tenantId)
    .eq('source_type', 'whatsapp')
    .eq('status', 'connected')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Modelos do WhatsApp</h1>
          <p>Liste, crie e exclua modelos de mensagem pela API oficial da Meta.</p>
        </div>
        <Link className="btn btn-secondary" href="/configuracoes">← Configurações</Link>
      </div>
      <WhatsAppTemplatesManager tenantId={tenantId} connections={(data || []) as Connection[]} />
    </div>
  )
}
