'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Connection = {
  id: string
  display_name: string | null
  phone_number: string | null
}

type Template = {
  id?: string
  name: string
  status?: string
  category?: string
  language?: string
  components?: Array<{ type?: string; text?: string }>
}

type Props = {
  tenantId: string
  connections: Connection[]
}

export function WhatsAppTemplatesManager({ tenantId, connections }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [connectionId, setConnectionId] = useState(connections[0]?.id ?? '')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadTemplates(targetConnectionId = connectionId) {
    if (!targetConnectionId) return
    setLoading(true)
    setError('')
    const { data, error: fnError } = await supabase.functions.invoke('whatsapp-templates', {
      body: { tenant_id: tenantId, connection_id: targetConnectionId, action: 'list' },
    })
    setLoading(false)
    if (fnError || data?.error) {
      setTemplates([])
      setError(data?.meta_error || data?.error || fnError?.message || 'Não foi possível carregar os modelos.')
      return
    }
    setTemplates((data?.templates || []) as Template[])
  }

  useEffect(() => {
    if (!connectionId) return
    const timer = window.setTimeout(() => {
      void loadTemplates(connectionId)
    }, 0)
    return () => window.clearTimeout(timer)
    // loadTemplates intentionally depends on the selected connection only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId])

  async function createTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!connectionId) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    setMessage('')
    const { data, error: fnError } = await supabase.functions.invoke('whatsapp-templates', {
      body: {
        tenant_id: tenantId,
        connection_id: connectionId,
        action: 'create',
        name: String(form.get('name') || ''),
        language: String(form.get('language') || 'pt_BR'),
        category: String(form.get('category') || 'UTILITY'),
        body_text: String(form.get('body_text') || ''),
      },
    })
    setSaving(false)
    if (fnError || data?.error) {
      setError(data?.meta_error || data?.error || fnError?.message || 'Não foi possível criar o modelo.')
      return
    }
    event.currentTarget.reset()
    setMessage('Modelo enviado para análise da Meta.')
    await loadTemplates(connectionId)
  }

  async function deleteTemplate(name: string) {
    if (!connectionId || !confirm(`Excluir o modelo “${name}”?`)) return
    setError('')
    setMessage('')
    const { data, error: fnError } = await supabase.functions.invoke('whatsapp-templates', {
      body: { tenant_id: tenantId, connection_id: connectionId, action: 'delete', name },
    })
    if (fnError || data?.error) {
      setError(data?.meta_error || data?.error || fnError?.message || 'Não foi possível excluir o modelo.')
      return
    }
    setMessage('Modelo excluído.')
    await loadTemplates(connectionId)
  }

  if (connections.length === 0) {
    return <div className="card card-pad"><div className="empty">Conecte um WhatsApp Business antes de gerenciar modelos.</div></div>
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="card card-pad">
        <div className="field" style={{ maxWidth: 420, marginBottom: 0 }}>
          <label>Número conectado</label>
          <select className="select" value={connectionId} onChange={(e) => setConnectionId(e.target.value)}>
            {connections.map((connection) => (
              <option key={connection.id} value={connection.id}>
                {connection.display_name || 'WhatsApp Business'}{connection.phone_number ? ` · ${connection.phone_number}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card card-pad">
        <div className="page-head" style={{ marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0 }}>Modelos existentes</h2>
            <p>Os status e conteúdos abaixo vêm diretamente da API oficial do WhatsApp.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => void loadTemplates()} disabled={loading}>
            {loading ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>
        {loading ? (
          <div className="empty">Carregando modelos…</div>
        ) : templates.length === 0 ? (
          <div className="empty">Nenhum modelo retornado pela Meta para esta conta.</div>
        ) : (
          <div className="member-list">
            {templates.map((template) => {
              const body = template.components?.find((component) => component.type === 'BODY')?.text
              return (
                <div className="member-row" key={template.id || `${template.name}-${template.language}`}>
                  <div>
                    <strong>{template.name}</strong>
                    <small>{template.category || '—'} · {template.language || '—'} · {template.status || '—'}</small>
                    {body && <small style={{ marginTop: 6 }}>{body}</small>}
                  </div>
                  <button className="btn btn-danger" onClick={() => void deleteTemplate(template.name)}>Excluir</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card card-pad">
        <h2 style={{ marginTop: 0 }}>Criar modelo</h2>
        <p className="muted">O modelo é enviado à Meta e só pode ser usado após aprovação.</p>
        <form onSubmit={createTemplate}>
          <div className="form-grid">
            <div className="field">
              <label>Nome</label>
              <input className="input" name="name" placeholder="confirmacao_agendamento" pattern="[A-Za-z0-9_ -]+" required />
            </div>
            <div className="field">
              <label>Idioma</label>
              <select className="select" name="language" defaultValue="pt_BR">
                <option value="pt_BR">Português (Brasil)</option>
                <option value="en_US">English (US)</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div className="field">
              <label>Categoria</label>
              <select className="select" name="category" defaultValue="UTILITY">
                <option value="UTILITY">Utilidade</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Autenticação</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Mensagem</label>
            <textarea className="input" name="body_text" rows={5} maxLength={1024} placeholder="Olá! Seu atendimento foi confirmado." required />
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Enviando…' : 'Enviar para análise'}</button>
        </form>
      </div>
    </div>
  )
}
