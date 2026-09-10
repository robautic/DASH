'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MetaEmbeddedSignup } from '@/components/meta-embedded-signup'
import { WhatsAppQrConnect } from '@/components/whatsapp-qr-connect'
import { UiIcon } from '@/components/ui-icon'

type Connection = {
  connection_id: string
  display_name: string | null
  phone_number: string | null
  provider: string
  source_type: string
  status: string
  last_sync_at: string | null
  message: string
  action_key: string
  connection_mode: 'coexistence' | 'cloud_api' | 'qr_web' | 'unknown' | string
}

function modeLabel(mode: string, provider: string) {
  if (mode === 'qr_web' || provider === 'evolution_baileys') return 'QR Code · WhatsApp Web'
  if (mode === 'coexistence') return 'Coexistência'
  if (mode === 'cloud_api') return 'Cloud API'
  return 'Modo não identificado'
}

export function ConnectionsManager({
  tenantId,
  initial,
  canManage,
}: {
  tenantId: string
  initial: Connection[]
  canManage: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
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
    ;(event.currentTarget as HTMLFormElement).reset()
    router.refresh()
  }

  async function disconnect(id: string) {
    if (!confirm('Desconectar este número? O histórico permanecerá salvo.')) return
    const { error } = await createClient().rpc('disconnect_connection', {
      p_tenant_id: tenantId,
      p_connection_id: id,
    })
    if (error) return setError(error.message)
    router.refresh()
  }

  return (
    <>
      <div className="connection-choice-grid">
        <section className="card connection-choice featured">
          <div className="connect-badge">⚡ CONEXÃO RÁPIDA</div>
          <h2>Escaneie um QR Code e comece.</h2>
          <p>
            Ideal para quem só quer conectar o WhatsApp que já usa no celular sem passar pelo cadastro empresarial da Meta.
          </p>
          <div className="connect-actions">
            <WhatsAppQrConnect tenantId={tenantId} canManage={canManage} onConnected={() => router.refresh()} />
          </div>
          <div className="meta-note">
            Usa um dispositivo vinculado do WhatsApp Web. É a opção mais simples, mas não é a API oficial da Meta e pode exigir reconexão quando a sessão expirar.
          </div>
        </section>

        <section className="card connection-choice">
          <div className="connect-badge"><UiIcon name="whatsapp" size={14} /> API OFICIAL</div>
          <h2>Conecte pela Meta.</h2>
          <p>
            Para empresas que precisam de templates, maior estabilidade e uma integração oficial com WhatsApp Business Platform.
          </p>
          <div className="connect-actions">
            {canManage ? (
              <MetaEmbeddedSignup tenantId={tenantId} onConnected={() => router.refresh()} />
            ) : (
              <span className="premium-pill">Somente owner/admin pode conectar</span>
            )}
          </div>
          <div className="meta-note">
            Coexistência mantém o WhatsApp Business no celular. Cloud API dedicada atende operações que usam um número principalmente na plataforma.
          </div>
        </section>
      </div>

      <aside className="card connection-explainer">
        <div>
          <strong>Qual caminho usar?</strong>
          <span>QR Code para começar rápido · Meta para operação oficial e escala.</span>
        </div>
        <Link className="btn btn-secondary" href="/configuracoes/modelos">Gerenciar modelos da Meta</Link>
      </aside>

      <section className="card card-pad">
        <div className="card-title-row">
          <div>
            <h3>Números conectados</h3>
            <div className="card-kicker">Saúde e modo de cada integração</div>
          </div>
          <span className="premium-pill">{initial.length} conexão{initial.length === 1 ? '' : 'ões'}</span>
        </div>

        {error && <div className="error-box" style={{ marginTop: 12 }}>{error}</div>}

        <div className="connection-list">
          {initial.map((c) => (
            <div className="connection-row" key={c.connection_id}>
              <div>
                <strong>{c.display_name || c.phone_number || 'WhatsApp Business'}</strong>
                <small>{c.phone_number || 'Número não informado'} · {c.message}</small>
              </div>
              <div className="row-actions">
                <span className="premium-pill">{modeLabel(c.connection_mode, c.provider)}</span>
                <span className={`connection-status ${c.status}`}>{c.status}</span>
                {canManage && c.status !== 'disconnected' && (
                  <button className="btn btn-danger" onClick={() => void disconnect(c.connection_id)}>Desconectar</button>
                )}
              </div>
            </div>
          ))}
          {!initial.length && <div className="empty">Nenhum número conectado ainda.</div>}
        </div>
      </section>

      {canManage && (
        <details className="advanced-connect">
          <summary>Configuração avançada · token manual da Meta</summary>
          <form onSubmit={connect}>
            <div className="form-grid">
              <div className="field"><label>Nome da conexão</label><input className="input" name="display_name" placeholder="WhatsApp comercial" /></div>
              <div className="field"><label>Phone Number ID</label><input className="input" name="phone_number_id" required /></div>
              <div className="field"><label>Business Account ID</label><input className="input" name="business_account_id" required /></div>
              <div className="field"><label>Access Token</label><input className="input" name="access_token" type="password" autoComplete="off" required /></div>
            </div>
            <button className="btn btn-secondary" disabled={loading}>{loading ? 'Validando…' : 'Conectar manualmente'}</button>
          </form>
        </details>
      )}
    </>
  )
}
