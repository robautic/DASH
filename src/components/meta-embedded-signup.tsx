'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SignupData = { phone_number_id?: string; waba_id?: string; business_id?: string }
type FbResponse = { authResponse?: { code?: string }; status?: string }
type FbApi = {
  init: (options: Record<string, unknown>) => void
  login: (callback: (response: FbResponse) => void, options: Record<string, unknown>) => void
}
type ConnectionMode = 'coexistence' | 'cloud_api'

declare global {
  interface Window { FB?: FbApi; fbAsyncInit?: () => void }
}

function friendlyError(code?: string, fallback?: string) {
  if (code === 'meta_app_not_configured') return 'A integração oficial da Meta ainda não foi ativada pelo administrador do Dash e Pipe.'
  if (code === 'meta_code_exchange_failed') return 'A autorização da Meta expirou ou não pôde ser concluída. Tente conectar novamente.'
  if (code === 'meta_phone_validation_failed') return 'A Meta não conseguiu validar esse número para a conexão escolhida.'
  if (code === 'meta_webhook_subscription_failed') return 'O número foi autorizado, mas a assinatura dos eventos do WhatsApp não foi concluída.'
  return fallback || 'Não foi possível concluir a conexão.'
}

export function MetaEmbeddedSignup({ tenantId, onConnected }: { tenantId: string; onConnected?: () => void }) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID || ''
  const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID || ''
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState<ConnectionMode | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const codeRef = useRef('')
  const sessionRef = useRef<SignupData>({})
  const modeRef = useRef<ConnectionMode>('coexistence')
  const completing = useRef(false)
  const configured = Boolean(appId && configId)

  const complete = useCallback(async () => {
    if (completing.current || !codeRef.current || !sessionRef.current.phone_number_id || !sessionRef.current.waba_id) return
    completing.current = true
    setLoading(modeRef.current)

    const { data, error: fnError } = await createClient().functions.invoke('whatsapp-embedded-signup', {
      body: {
        tenant_id: tenantId,
        code: codeRef.current,
        phone_number_id: sessionRef.current.phone_number_id,
        waba_id: sessionRef.current.waba_id,
        business_id: sessionRef.current.business_id || null,
        connection_mode: modeRef.current,
      },
    })

    setLoading(null)
    completing.current = false
    if (fnError || data?.error) {
      setError(friendlyError(data?.error, data?.message || data?.meta_error || fnError?.message))
      return
    }

    setMessage(modeRef.current === 'coexistence'
      ? 'WhatsApp conectado oficialmente. Você pode continuar usando o WhatsApp Business no celular e atender também pelo Dash e Pipe.'
      : 'WhatsApp Business conectado via Cloud API dedicada.')
    setError('')
    onConnected?.()
  }, [tenantId, onConnected])

  useEffect(() => {
    if (!configured) return

    const listener = (event: MessageEvent) => {
      try {
        const host = new URL(event.origin).hostname
        if (host !== 'facebook.com' && !host.endsWith('.facebook.com')) return
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return

        const finished = payload.event === 'FINISH' || payload.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
        if (finished) {
          sessionRef.current = payload.data || {}
          void complete()
        } else if (payload.event === 'CANCEL') {
          setError('A conexão foi cancelada. Nenhuma alteração foi feita no número.')
          setLoading(null)
        } else if (payload.event === 'ERROR') {
          setError(payload.data?.error_message || 'A Meta informou que não foi possível concluir este onboarding.')
          setLoading(null)
        }
      } catch {}
    }

    window.addEventListener('message', listener)
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, autoLogAppEvents: true, xfbml: false, version: 'v25.0' })
      setReady(true)
    }

    if (window.FB) window.fbAsyncInit()
    else if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
      document.body.appendChild(script)
    }

    return () => window.removeEventListener('message', listener)
  }, [appId, configured, complete])

  function launch(mode: ConnectionMode) {
    setError('')
    setMessage('')
    if (!configured) {
      setError('A conexão com a Meta ainda está sendo configurada no Dash e Pipe.')
      return
    }
    if (!window.FB || !ready) {
      setError('A janela segura da Meta ainda está carregando. Tente novamente em instantes.')
      return
    }

    modeRef.current = mode
    setLoading(mode)
    sessionRef.current = {}
    codeRef.current = ''

    const featureType = mode === 'coexistence' ? 'whatsapp_business_app_onboarding' : ''
    window.FB.login(response => {
      const code = response.authResponse?.code || ''
      if (!code) {
        setLoading(null)
        setError('A autorização da Meta não foi concluída.')
        return
      }
      codeRef.current = code
      void complete()
    }, {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {}, featureType, sessionInfoVersion: '3' },
    })
  }

  return (
    <div className="connection-mode-grid">
      <article className="connection-mode-card recommended">
        <div className="mode-head"><span className="premium-pill">Recomendado</span><span className="mode-icon">↔</span></div>
        <h3>Usar o mesmo WhatsApp Business</h3>
        <p>Conecte oficialmente o número que já está no seu celular e leve o atendimento para o Dash e Pipe.</p>
        <ul>
          <li>Mesmo número no WhatsApp Business App</li>
          <li>Atendimento também dentro do Dash e Pipe</li>
          <li>Pipeline, equipe, métricas e integrações</li>
        </ul>
        <div className="mode-preflight">
          <strong>Como funciona</strong>
          <span>O Dash e Pipe abre o processo seguro da Meta. Siga as etapas exibidas pela Meta e confirme o número no celular quando solicitado.</span>
          <small>A Meta decide as etapas disponíveis para cada conta e número durante o onboarding.</small>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => launch('coexistence')} disabled={Boolean(loading) || (!ready && configured)}>
          {loading === 'coexistence' ? 'Abrindo conexão oficial…' : 'Conectar meu WhatsApp Business'}
        </button>
      </article>

      <article className="connection-mode-card">
        <div className="mode-head"><span className="mode-label">Cloud API</span><span className="mode-icon">☁</span></div>
        <h3>Usar número dedicado à API</h3>
        <p>Para operações que querem centralizar o atendimento do número diretamente no Dash e Pipe e nas integrações oficiais.</p>
        <ul>
          <li>Cloud API oficial da Meta</li>
          <li>Operação centralizada para equipe e automações</li>
          <li>Separação clara entre número pessoal e operação</li>
        </ul>
        <div className="mode-preflight neutral">
          <strong>Indicado quando</strong>
          <span>O número será dedicado à operação via API e não depende do uso diário no WhatsApp Business App.</span>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => launch('cloud_api')} disabled={Boolean(loading) || (!ready && configured)}>
          {loading === 'cloud_api' ? 'Abrindo Meta…' : 'Conectar número dedicado'}
        </button>
      </article>

      {!configured && <div className="embedded-status setup-pending"><strong>Configuração pendente</strong><span>O fluxo oficial já está implementado. Falta liberar o App ID e o Configuration ID da Meta no ambiente de produção.</span></div>}
      {message && <div className="success-box connection-feedback">{message}</div>}
      {error && <div className="error-box connection-feedback">{error}</div>}
    </div>
  )
}
