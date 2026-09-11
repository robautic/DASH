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
  if (mode === 'qr_web' || provider === 'evolution_baileys')
    return 'QR Code · WhatsApp Web'
  if (mode === 'coexistence') return 'Coexistência oficial'
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
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const body = {
      tenant_id: tenantId,
      display_name: String(form.get('display_name') || 'WhatsApp'),
      phone_number_id: String(form.get('phone_number_id') || ''),
      business_account_id: String(form.get('business_account_id') || ''),
      access_token: String(form.get('access_token') || ''),
    }
    const { error } = await createClient().functions.invoke(
      'whatsapp-configure',
      { body },
    )
    setLoading(false)
    if (error) return setError(error.message)
    formElement.reset()
    router.refresh()
  }

  async function disconnect(id: string) {
    if (!confirm('Desconectar este número? O histórico permanecerá salvo.'))
      return
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
          <div className="connect-badge">
            <UiIcon name="whatsapp" size={14} /> RECOMENDADO · OFICIAL
          </div>
          <h2>Conecte o WhatsApp Business e continue usando no celular.</h2>
          <p>
            A Coexistência conecta o mesmo número à Fluxolu pela plataforma
            oficial da Meta, sem obrigar você a abandonar o WhatsApp Business
            App.
          </p>
          <div className="connect-actions">
            {canManage ? (
              <MetaEmbeddedSignup
                tenantId={tenantId}
                onConnected={() => router.refresh()}
              />
            ) : (
              <span className="premium-pill">
                Somente administradores podem conectar
              </span>
            )}
          </div>
          <div className="meta-note">
            O processo acontece no onboarding seguro da Meta. Dependendo da
            etapa e da elegibilidade do número, a Meta pode solicitar
            confirmações no celular e apresentar o vínculo por QR Code.
          </div>
        </section>

        <details className="card connection-choice alternative-connection">
          <summary>Outra opção: conectar como dispositivo por QR Code</summary>
          <div className="connect-badge">⚡ ALTERNATIVA RÁPIDA</div>
          <h2>Conectar como dispositivo pelo QR Code.</h2>
          <p>
            Alternativa para quem quer vincular o WhatsApp pelo fluxo de
            dispositivo do WhatsApp Web sem usar a API oficial da Meta.
          </p>
          <div className="connect-actions">
            <WhatsAppQrConnect
              tenantId={tenantId}
              canManage={canManage}
              onConnected={() => router.refresh()}
            />
          </div>
          <div className="meta-note">
            Esta é uma conexão não oficial. A sessão pode exigir reconexão e
            depende de um servidor configurado para permanecer ativa.
          </div>
        </details>
      </div>

      <aside className="card connection-explainer">
        <div>
          <strong>Qual caminho usar?</strong>
          <span>
            Coexistência oficial primeiro · QR via WhatsApp Web somente como
            alternativa.
          </span>
        </div>
        <Link className="btn btn-secondary" href="/configuracoes/modelos">
          Gerenciar modelos da Meta
        </Link>
      </aside>

      <section className="card card-pad">
        <div className="card-title-row">
          <div>
            <h3>Números conectados</h3>
            <div className="card-kicker">Saúde e modo de cada integração</div>
          </div>
          <span className="premium-pill">
            {initial.length} {initial.length === 1 ? 'conexão' : 'conexões'}
          </span>
        </div>

        {error && (
          <div className="error-box" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}

        <div className="connection-list">
          {initial.map((c) => (
            <div className="connection-row" key={c.connection_id}>
              <div>
                <strong>
                  {c.display_name || c.phone_number || 'WhatsApp Business'}
                </strong>
                <small>
                  {c.phone_number || 'Número não informado'} · {c.message}
                </small>
              </div>
              <div className="row-actions">
                <span className="premium-pill">
                  {modeLabel(c.connection_mode, c.provider)}
                </span>
                <span className={`connection-status ${c.status}`}>
                  {c.status}
                </span>
                {canManage && c.status !== 'disconnected' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => void disconnect(c.connection_id)}
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>
          ))}
          {!initial.length && (
            <div className="empty">Nenhum número conectado ainda.</div>
          )}
        </div>
      </section>

      {canManage && (
        <details className="advanced-connect">
          <summary>Configuração avançada · token manual da Meta</summary>
          <form onSubmit={connect}>
            <div className="form-grid">
              <div className="field">
                <label>Nome da conexão</label>
                <input
                  className="input"
                  name="display_name"
                  placeholder="WhatsApp comercial"
                />
              </div>
              <div className="field">
                <label>Phone Number ID</label>
                <input className="input" name="phone_number_id" required />
              </div>
              <div className="field">
                <label>Business Account ID</label>
                <input className="input" name="business_account_id" required />
              </div>
              <div className="field">
                <label>Access Token</label>
                <input
                  className="input"
                  name="access_token"
                  type="password"
                  autoComplete="off"
                  required
                />
              </div>
            </div>
            <button className="btn btn-secondary" disabled={loading}>
              {loading ? 'Validando…' : 'Conectar manualmente'}
            </button>
          </form>
        </details>
      )}
    </>
  )
}
