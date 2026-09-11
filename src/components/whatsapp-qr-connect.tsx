'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  tenantId: string
  canManage: boolean
  onConnected: () => void
}

type StartResponse = {
  ok?: boolean
  connection_id?: string
  qr_base64?: string | null
  error?: string
  message?: string
}

function friendlyError(error?: string, message?: string) {
  if (error === 'evolution_not_configured') return 'A conexão rápida está preparada, mas o servidor de QR Code ainda não foi configurado.'
  if (error === 'forbidden') return 'Você não tem permissão para conectar este WhatsApp.'
  if (error === 'admin_required') return 'Somente owner ou admin pode criar uma conexão.'
  return message || error || 'Não foi possível gerar o QR Code.'
}

export function WhatsAppQrConnect({ tenantId, canManage, onConnected }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [connectionId, setConnectionId] = useState('')
  const [qr, setQr] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  async function start() {
    setOpen(true)
    setLoading(true)
    setError('')
    setStatus('')
    const { data, error: invokeError } = await createClient().functions.invoke<StartResponse>('whatsapp-qr', {
      body: { tenant_id: tenantId, action: 'start' },
    })
    setLoading(false)
    if (invokeError || data?.error || !data?.connection_id) {
      setError(friendlyError(data?.error || invokeError?.message, data?.message))
      return
    }
    setConnectionId(data.connection_id)
    setQr(data.qr_base64 || '')
    setStatus('Aguardando leitura do QR Code')
  }

  async function checkStatus() {
    if (!connectionId) return
    setChecking(true)
    setError('')
    const { data, error: invokeError } = await createClient().functions.invoke('whatsapp-qr', {
      body: { tenant_id: tenantId, action: 'status', connection_id: connectionId },
    })
    setChecking(false)
    if (invokeError || data?.error) {
      setError(friendlyError(data?.error || invokeError?.message, data?.message))
      return
    }
    if (data?.connected) {
      setStatus('WhatsApp conectado com sucesso')
      onConnected()
      return
    }
    if (data?.qr_base64) setQr(data.qr_base64)
    setStatus('Ainda aguardando a leitura do QR Code')
  }

  function close() {
    setOpen(false)
    setError('')
    setStatus('')
    setQr('')
    setConnectionId('')
  }

  if (!canManage) return <span className="premium-pill">Somente owner/admin pode conectar</span>

  return (
    <>
      <button className="btn btn-primary" onClick={() => void start()}>
        ⚡ Conectar com QR Code
      </button>

      {open && (
        <div className="qr-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
          <section className="card qr-modal" role="dialog" aria-modal="true" aria-label="Conectar WhatsApp por QR Code">
            <div className="qr-modal-head">
              <div>
                <div className="connect-badge">⚡ CONEXÃO RÁPIDA</div>
                <h3>Leia o QR Code com seu WhatsApp</h3>
                <p>WhatsApp → Aparelhos conectados → Conectar um aparelho.</p>
              </div>
              <button className="topbar-icon" onClick={close} aria-label="Fechar">×</button>
            </div>

            <div className="qr-body">
              {loading ? (
                <div className="qr-placeholder">Gerando QR Code…</div>
              ) : qr ? (
                <div className="qr-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr.startsWith('data:image') ? qr : `data:image/png;base64,${qr}`} alt="QR Code para conectar o WhatsApp" />
                </div>
              ) : (
                <div className="qr-placeholder">QR Code indisponível</div>
              )}

              <div className="qr-copy">
                <strong>{status || 'Pronto para conectar'}</strong>
                <span>Essa opção usa uma sessão de dispositivo vinculado do WhatsApp Web e não a API oficial da Meta.</span>
                {error && <div className="error-box">{error}</div>}
                {connectionId && (
                  <button className="btn btn-secondary" onClick={() => void checkStatus()} disabled={checking}>
                    {checking ? 'Verificando…' : 'Já escaneei · verificar conexão'}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
