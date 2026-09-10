'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MetaEmbeddedSignup } from '@/components/meta-embedded-signup'
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
  connection_mode: 'coexistence' | 'cloud_api' | 'unknown' | string
}

function modeLabel(mode: string) {
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
      <div className="connect-hero">
        <section className="card connect-main">
          <div className="connect-badge"><UiIcon name="whatsapp" size={14} /> WHATSAPP BUSINESS</div>
          <h2>Conecte sem abandonar o número que você já usa.</h2>
          <p>
            Para quem já atende pelo WhatsApp Business, a Coexistência mantém o app no celular e conecta o mesmo número ao Dash e Pipe. Para operações dedicadas, use a Cloud API.
          </p>
          <div className="connect-actions">
            {canManage ? (
              <MetaEmbeddedSignup tenantId={tenantId} onConnected={() => router.refresh()} />
            ) : (
              <span className="premium-pill">Somente owner/admin pode conectar</span>
            )}
          </div>
          <div className="meta-note">
            O onboarding oficial da Meta identifica empresa, WABA e número. Tokens ficam protegidos no backend.
          </div>
        </section>

        <aside className="card connect-side">
          <div className="card-title-row">
            <div>
              <h3>Qual modo escolher?</h3>
              <div className="card-kicker">Coexistência é a opção recomendada para quem já usa o Business App</div>
            </div>
          </div>
          <div className="connect-steps">
            <div className="connect-step">
              <span>↔</span>
              <div><strong>Coexistência · recomendado</strong><small>Mesmo número no celular e no Dash e Pipe.</small></div>
            </div>
            <div className="connect-step">
              <span>☁</span>
              <div><strong>Cloud API dedicada</strong><small>Ideal para um número operado principalmente pela plataforma.</small></div>
            </div>
            <div className="connect-step">
              <span>✓</span>
              <div><strong>Sem copiar token</strong><small>O fluxo oficial da Meta faz a autorização e o backend protege a credencial.</small></div>
            </div>
          </div>
        </aside>
      </div>

      <section className="card card-pad">
        <div className="card-title-row">
          <div>
            <h3>Números conectados</h3>
            <div className="card-kicker">Saúde e modo de cada integração</div>
          </div>
          <span className="premium-pill">{initial.length} conexão{initial.length === 1 ? '' : 'ões'}</span>
        </div>

        <div className="connection-list">
          {initial.map((c) => (
            <div className="connection-row" key={c.connection_id}>
              <div>
                <strong>{c.display_name || c.phone_number || 'WhatsApp Business'}</strong>
                <small>{c.phone_number || 'Número não informado'} · {c.message}</small>
              </div>
              <div className="row-actions">
                <span className="premium-pill">{modeLabel(c.connection_mode)}</span>
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
          <summary>Configuração avançada · token manual</summary>
          <form onSubmit={connect}>
            {error && <div className="error-box">{error}</div>}
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
