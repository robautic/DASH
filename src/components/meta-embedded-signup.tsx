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
      setError(data?.message || data?.meta_error || fnError?.message || 'Não foi possível concluir a conexão.')
      return
    }

    setMessage(modeRef.current === 'coexistence'
      ? 'Coexistência ativada. Seu WhatsApp Business pode continuar sendo usado junto com o Dash e Pipe.'
      : 'WhatsApp Business conectado via Cloud API.')
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
          setError('Conexão cancelada antes de concluir.')
          setLoading(null)
        } else if (payload.event === 'ERROR') {
          setError(payload.data?.error_message || 'A Meta retornou um erro no Embedded Signup.')
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
      setError('Faltam NEXT_PUBLIC_META_APP_ID e NEXT_PUBLIC_META_CONFIG_ID.')
      return
    }
    if (!window.FB || !ready) {
      setError('O SDK da Meta ainda está carregando. Tente novamente em instantes.')
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
        <h3>Continuar usando meu WhatsApp Business</h3>
        <p>Conecte o número ao Dash e Pipe sem abandonar o WhatsApp Business App no celular.</p>
        <ul>
          <li>Continue respondendo pelo celular</li>
          <li>Use o mesmo número na operação</li>
          <li>Centralize conversas, pipeline e métricas</li>
        </ul>
        <button type="button" className="btn btn-primary" onClick={() => launch('coexistence')} disabled={Boolean(loading) || (!ready && configured)}>
          {loading === 'coexistence' ? 'Conectando…' : 'Usar Coexistência'}
        </button>
      </article>

      <article className="connection-mode-card">
        <div className="mode-head"><span className="mode-label">Cloud API</span><span className="mode-icon">☁</span></div>
        <h3>Usar somente a API</h3>
        <p>Ideal para um número dedicado à operação, atendido diretamente pelo Dash e Pipe e integrações.</p>
        <ul>
          <li>Operação centralizada na plataforma</li>
          <li>Cloud API oficial da Meta</li>
          <li>Indicado para times e automações</li>
        </ul>
        <button type="button" className="btn btn-secondary" onClick={() => launch('cloud_api')} disabled={Boolean(loading) || (!ready && configured)}>
          {loading === 'cloud_api' ? 'Conectando…' : 'Conectar via Cloud API'}
        </button>
      </article>

      {!configured && <div className="embedded-status">Embedded Signup pronto no código. Falta cadastrar App ID e Configuration ID da Meta.</div>}
      {message && <div className="success-box connection-feedback">{message}</div>}
      {error && <div className="error-box connection-feedback">{error}</div>}
    </div>
  )
}
