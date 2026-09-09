'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function RecoveryForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(''); setMessage('')
    const email = String(new FormData(event.currentTarget).get('email') || '')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` })
    if (error) setError(error.message)
    else setMessage('Se este e-mail estiver cadastrado, o link de recuperação chegará em instantes.')
    setLoading(false)
  }

  return <form onSubmit={submit}>{error && <div className="error-box">{error}</div>}{message && <div className="success-box">{message}</div>}<div className="field"><label htmlFor="email">E-mail</label><input className="input" id="email" name="email" type="email" required /></div><button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Enviando…' : 'Enviar link'}</button><p className="muted" style={{ fontSize: 14, marginTop: 18 }}><Link className="text-link" href="/login">Voltar para entrar</Link></p></form>
}
