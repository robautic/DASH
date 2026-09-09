'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError(''); setMessage('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(form.get('password') || ''),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        data: {
          full_name: String(form.get('name') || ''),
          workspace_name: String(form.get('workspace') || ''),
        },
      },
    })
    if (error) {
      setError(error.message)
    } else if (data.session) {
      window.location.assign('/onboarding')
      return
    } else {
      setMessage(`Enviamos um link de confirmação para ${email}.`)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}
      <div className="field"><label htmlFor="name">Seu nome</label><input className="input" id="name" name="name" required /></div>
      <div className="field"><label htmlFor="workspace">Nome do negócio</label><input className="input" id="workspace" name="workspace" required /></div>
      <div className="field"><label htmlFor="email">E-mail</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="password">Senha</label><input className="input" id="password" name="password" type="password" autoComplete="new-password" required minLength={8} /></div>
      <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Criando…' : 'Criar workspace'}</button>
      <p className="muted" style={{ fontSize: 14, marginTop: 18 }}>Já possui conta? <Link className="text-link" href="/login">Entrar</Link></p>
    </form>
  )
}
