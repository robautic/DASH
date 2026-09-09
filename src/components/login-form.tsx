'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
    })
    if (error) {
      setError('Não foi possível entrar. Confira seu e-mail e senha.')
      setLoading(false)
      return
    }
    router.replace(params.get('next') || '/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="error-box">{error}</div>}
      <div className="field"><label htmlFor="email">E-mail</label><input className="input" id="email" name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label htmlFor="password">Senha</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required minLength={6} /></div>
      <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
      <p className="muted" style={{ fontSize: 14, marginTop: 18 }}>Esqueceu? <Link className="text-link" href="/recuperar-senha">Recuperar senha</Link></p>
      <p className="muted" style={{ fontSize: 14 }}>Ainda não tem conta? <Link className="text-link" href="/cadastro">Criar conta</Link></p>
    </form>
  )
}
