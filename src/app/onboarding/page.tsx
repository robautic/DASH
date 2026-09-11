import Link from 'next/link'
import { Brand } from '@/components/brand'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: bootstrap } = await supabase.rpc('get_app_bootstrap', { p_tenant_id: null })
  const app = (bootstrap || {}) as Record<string, unknown>
  const workspace = app.active_workspace as Record<string, unknown> | undefined
  const onboarding = (app.onboarding || {}) as Record<string, boolean>
  const tenantId = String(workspace?.tenant_id || workspace?.id || '')
  const checks = [
    ['workspace_created','Workspace criado'],
    ['whatsapp_connected','WhatsApp conectado'],
    ['has_conversations','Primeira conversa recebida'],
    ['pipeline_ready','Pipeline pronto'],
  ] as const

  return <main className="onboarding"><div className="card onboarding-card"><Brand /><h1>Prepare sua operação</h1><p className="muted">O Dash e Pipe começa simples: conecte o WhatsApp e deixe as conversas alimentarem seu pipeline e dashboard.</p><div className="steps">{checks.map(([key,label],i) => <div className={`step ${onboarding[key]?'done':''}`} key={key}><span className="step-mark">{onboarding[key]?'✓':i+1}</span><div><strong>{label}</strong><div className="muted" style={{fontSize:12}}>{onboarding[key]?'Concluído':'Pendente'}</div></div></div>)}</div>{tenantId ? <div style={{display:'flex',gap:9,flexWrap:'wrap'}}><Link className="btn btn-primary" href="/conexoes">Conectar WhatsApp</Link><Link className="btn btn-secondary" href="/dashboard">Ir para o Dashboard</Link></div> : <div className="error-box">Seu workspace ainda está sendo provisionado. Atualize a página em alguns segundos.</div>}</div></main>
}
