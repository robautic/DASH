'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Connection = { connection_id:string; display_name:string|null; phone_number:string|null; provider:string; source_type:string; status:string; last_sync_at:string|null; message:string; action_key:string }

export function ConnectionsManager({ tenantId, initial, canManage }: { tenantId:string; initial:Connection[]; canManage:boolean }) {
  const router = useRouter()
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('')
    const form = new FormData(event.currentTarget)
    const body = {
      tenant_id: tenantId,
      display_name: String(form.get('display_name') || 'WhatsApp'),
      phone_number_id: String(form.get('phone_number_id') || ''),
      business_account_id: String(form.get('business_account_id') || ''),
      access_token: String(form.get('access_token') || ''),
    }
    const { error } = await createClient().functions.invoke('whatsapp-configure', { body })
    setLoading(false)
    if (error) return setError(error.message)
    ;(event.currentTarget as HTMLFormElement).reset(); router.refresh()
  }

  async function disconnect(id: string) {
    if (!confirm('Desconectar este número? O histórico permanecerá salvo.')) return
    const { error } = await createClient().rpc('disconnect_connection', { p_tenant_id:tenantId, p_connection_id:id })
    if (error) return setError(error.message)
    router.refresh()
  }

  return <div className="connect-grid"><section className="card card-pad"><h2>Números conectados</h2><div className="connection-list">{initial.map((c) => <div className="connection-row" key={c.connection_id}><div><strong>{c.display_name || c.phone_number || 'WhatsApp'}</strong><small>{c.phone_number || 'Número não informado'} · {c.message}</small></div><div className="row-actions"><span className={`connection-status ${c.status}`}>{c.status}</span>{canManage && c.status !== 'disconnected' && <button className="btn btn-danger" onClick={() => void disconnect(c.connection_id)}>Desconectar</button>}</div></div>)}{!initial.length && <div className="empty">Nenhuma conexão ainda.</div>}</div></section><section className="card card-pad"><h2>Conectar WhatsApp</h2><p className="muted">Use os dados do aplicativo Meta / WhatsApp Cloud API. O token é enviado diretamente à função segura e armazenado no Vault.</p>{error && <div className="error-box">{error}</div>}{canManage ? <form onSubmit={connect}><div className="field"><label>Nome da conexão</label><input className="input" name="display_name" placeholder="WhatsApp comercial" /></div><div className="field"><label>Phone Number ID</label><input className="input" name="phone_number_id" required /></div><div className="field"><label>Business Account ID</label><input className="input" name="business_account_id" required /></div><div className="field"><label>Access Token</label><input className="input" name="access_token" type="password" autoComplete="off" required /></div><button className="btn btn-primary btn-block" disabled={loading}>{loading?'Validando…':'Conectar número'}</button></form> : <div className="error-box">Sua função no workspace não permite gerenciar conexões.</div>}<div className="code-note" style={{marginTop:16}}>Webhook público: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'SUPABASE_URL'}/functions/v1/whatsapp-webhook</div></section></div>
}
