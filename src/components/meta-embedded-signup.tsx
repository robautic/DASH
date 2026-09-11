'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { connectionError, isMetaOrigin } from '@/lib/whatsapp-onboarding'

type SignupData = {
  phone_number_id?: string
  waba_id?: string
  business_id?: string
}
type FbResponse = { authResponse?: { code?: string }; status?: string }
type FbApi = {
  init: (options: Record<string, unknown>) => void
  login: (
    callback: (response: FbResponse) => void,
    options: Record<string, unknown>,
  ) => void
}
type ConnectionMode = 'coexistence' | 'cloud_api'
declare global {
  interface Window {
    FB?: FbApi
    fbAsyncInit?: () => void
  }
}

export function MetaEmbeddedSignup({
  tenantId,
  onConnected,
}: {
  tenantId: string
  onConnected?: () => void
}) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID || ''
  const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID || ''
  const configured = Boolean(appId && configId)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState<ConnectionMode | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sdkFailed, setSdkFailed] = useState(false)
  const codeRef = useRef('')
  const sessionRef = useRef<SignupData>({})
  const modeRef = useRef<ConnectionMode>('coexistence')
  const active = useRef(false)
  const attempt = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abort = useRef<AbortController | null>(null)
  const connectedCallback = useRef(onConnected)
  useEffect(() => {
    connectedCallback.current = onConnected
  }, [onConnected])
  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }, [])

  const complete = useCallback(async () => {
    if (
      !active.current ||
      !codeRef.current ||
      !sessionRef.current.phone_number_id ||
      !sessionRef.current.waba_id
    )
      return
    active.current = false
    clearTimer()
    const currentAttempt = attempt.current
    abort.current = new AbortController()
    const timeout = setTimeout(() => abort.current?.abort(), 30000)
    setMessage(
      'Confirmando a autorização e ativando o recebimento de mensagens…',
    )
    try {
      const { data, error: fnError } = await createClient().functions.invoke(
        'whatsapp-embedded-signup',
        {
          body: {
            tenant_id: tenantId,
            code: codeRef.current,
            phone_number_id: sessionRef.current.phone_number_id,
            waba_id: sessionRef.current.waba_id,
            business_id: sessionRef.current.business_id || null,
            connection_mode: modeRef.current,
          },
          signal: abort.current.signal,
        },
      )
      if (attempt.current !== currentAttempt) return
      if (
        fnError ||
        data?.error ||
        !data?.ok ||
        data?.connection?.status !== 'connected'
      ) {
        const text = await connectionError(fnError, data)
        if (attempt.current === currentAttempt) {
          setError(text)
          setMessage('')
        }
        return
      }
      setMessage(
        modeRef.current === 'coexistence'
          ? 'WhatsApp conectado à Fluxolu. Você pode continuar usando o WhatsApp Business no celular.'
          : 'WhatsApp conectado pela Cloud API.',
      )
      connectedCallback.current?.()
    } catch {
      if (attempt.current === currentAttempt) {
        setError(
          'A confirmação não terminou. Verifique a lista de números conectados antes de tentar novamente.',
        )
        setMessage('')
      }
    } finally {
      clearTimeout(timeout)
      if (attempt.current === currentAttempt) {
        setLoading(null)
        codeRef.current = ''
        sessionRef.current = {}
      }
    }
  }, [tenantId, clearTimer])

  useEffect(() => {
    if (!configured) return
    let mounted = true
    const initialize = () => {
      if (!mounted || !window.FB) return
      try {
        window.FB.init({
          appId,
          autoLogAppEvents: false,
          xfbml: false,
          version: 'v25.0',
        })
        setReady(true)
        setSdkFailed(false)
      } catch {
        setSdkFailed(true)
      }
    }
    const fail = () => {
      if (mounted) setSdkFailed(true)
    }
    const oldInit = window.fbAsyncInit
    window.fbAsyncInit = initialize
    let script = document.getElementById(
      'facebook-jssdk',
    ) as HTMLScriptElement | null
    if (window.FB) initialize()
    else {
      if (!script) {
        script = document.createElement('script')
        script.id = 'facebook-jssdk'
        script.async = true
        script.defer = true
        script.crossOrigin = 'anonymous'
        script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
        document.body.appendChild(script)
      }
      script.addEventListener('load', initialize)
      script.addEventListener('error', fail)
    }
    const sdkTimeout = setTimeout(() => {
      if (!window.FB) fail()
    }, 15000)
    return () => {
      mounted = false
      clearTimeout(sdkTimeout)
      script?.removeEventListener('load', initialize)
      script?.removeEventListener('error', fail)
      if (window.fbAsyncInit === initialize) window.fbAsyncInit = oldInit
    }
  }, [appId, configured])

  useEffect(() => {
    function listener(event: MessageEvent) {
      if (!active.current || !isMetaOrigin(event.origin)) return
      try {
        const payload =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return
        if (
          payload.event === 'FINISH' ||
          payload.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
        ) {
          sessionRef.current = payload.data || {}
          if (
            !sessionRef.current.phone_number_id ||
            !sessionRef.current.waba_id
          ) {
            setError(
              'A Meta não retornou o número selecionado. Conclua todas as etapas e tente novamente.',
            )
            active.current = false
            clearTimer()
            setLoading(null)
            return
          }
          void complete()
        } else if (payload.event === 'CANCEL' || payload.event === 'ERROR') {
          active.current = false
          attempt.current++
          clearTimer()
          setLoading(null)
          setMessage('')
          setError(
            payload.event === 'CANCEL'
              ? 'Você cancelou a autorização. Pode tentar novamente quando quiser.'
              : 'A Meta não concluiu a autorização. Confira a conta e o número selecionados.',
          )
        }
      } catch {
        /* Ignore unrelated or malformed messages. */
      }
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
      active.current = false
      // Invalidate current async callbacks; this is a counter, not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      attempt.current++
      clearTimer()
      abort.current?.abort()
    }
  }, [complete, clearTimer])

  function launch(mode: ConnectionMode) {
    if (!configured || !ready || !window.FB || active.current || loading) return
    setError('')
    setMessage('')
    modeRef.current = mode
    setLoading(mode)
    sessionRef.current = {}
    codeRef.current = ''
    active.current = true
    const currentAttempt = ++attempt.current
    clearTimer()
    timer.current = setTimeout(() => {
      if (attempt.current === currentAttempt && active.current) {
        active.current = false
        attempt.current++
        setLoading(null)
        setError(
          'A janela da Meta não concluiu a autorização. Permita pop-ups e tente novamente.',
        )
      }
    }, 180000)
    try {
      window.FB.login(
        (response) => {
          if (!active.current || attempt.current !== currentAttempt) return
          const code = response.authResponse?.code
          if (!code) {
            active.current = false
            clearTimer()
            setLoading(null)
            setError(
              'A autorização não foi concluída. Permita a janela da Meta e tente novamente.',
            )
            return
          }
          codeRef.current = code
          void complete()
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType:
              mode === 'coexistence' ? 'whatsapp_business_app_onboarding' : '',
            sessionInfoVersion: '3',
          },
        },
      )
    } catch {
      active.current = false
      clearTimer()
      setLoading(null)
      setError(
        'Não foi possível abrir a Meta. Permita pop-ups e tente novamente.',
      )
    }
  }
  return (
    <div className="connection-mode-grid">
      <article className="connection-mode-card recommended">
        <div className="mode-head">
          <span className="premium-pill">Recomendado</span>
          <span className="mode-icon">↔</span>
        </div>
        <h3>Usar o mesmo WhatsApp Business</h3>
        <p>
          Conecte oficialmente o número que já está no seu celular e leve o
          atendimento para a Fluxolu.
        </p>
        <ul>
          <li>Mesmo número no WhatsApp Business App</li>
          <li>Atendimento também dentro da Fluxolu</li>
          <li>Pipeline, equipe, métricas e integrações</li>
        </ul>
        <div className="mode-preflight">
          <strong>Antes de começar</strong>
          <span>
            Tenha seu celular com o WhatsApp Business atualizado e acesso de
            administrador à conta empresarial da Meta. A Fluxolu abre a
            autorização; escolha o número que já usa e confirme no celular.
          </span>
          <small>
            A Meta decide as etapas disponíveis para cada conta e número durante
            o onboarding.
          </small>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => launch('coexistence')}
          disabled={!configured || !ready || Boolean(loading)}
        >
          {loading === 'coexistence'
            ? 'Abrindo conexão oficial…'
            : 'Conectar meu WhatsApp Business'}
        </button>
      </article>

      <article className="connection-mode-card">
        <div className="mode-head">
          <span className="mode-label">Cloud API</span>
          <span className="mode-icon">☁</span>
        </div>
        <h3>Usar número dedicado à API</h3>
        <p>
          Para operações que querem centralizar o atendimento do número
          diretamente na Fluxolu e nas integrações oficiais.
        </p>
        <ul>
          <li>Cloud API oficial da Meta</li>
          <li>Operação centralizada para equipe e automações</li>
          <li>Separação clara entre número pessoal e operação</li>
        </ul>
        <div className="mode-preflight neutral">
          <strong>Indicado quando</strong>
          <span>
            O número será dedicado à operação via API e não depende do uso
            diário no WhatsApp Business App.
          </span>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => launch('cloud_api')}
          disabled={!configured || !ready || Boolean(loading)}
        >
          {loading === 'cloud_api'
            ? 'Abrindo Meta…'
            : 'Conectar número dedicado'}
        </button>
      </article>

      {!configured && (
        <div className="embedded-status setup-pending">
          <strong>Configuração pendente</strong>
          <span>
            Um administrador precisa ativar a integração da Meta antes de
            conectar seu número. A configuração atual ainda não permite iniciar.
          </span>
        </div>
      )}
      {sdkFailed && (
        <div className="error-box connection-feedback" role="alert">
          Não foi possível carregar a Meta. Verifique sua internet e
          bloqueadores de conteúdo.{' '}
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Tentar carregar novamente
          </button>
        </div>
      )}
      {configured && !ready && !sdkFailed && (
        <p role="status">Carregando a conexão segura da Meta…</p>
      )}
      {message && (
        <div className="success-box connection-feedback" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="error-box connection-feedback" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
