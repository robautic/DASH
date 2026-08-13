import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export function LoginPage() {
  const { firebaseUser, login, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (firebaseUser) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch {
      setError('E-mail ou senha incorretos.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Digite seu e-mail acima primeiro.')
      return
    }
    setError(null)
    try {
      await resetPassword(email)
      setInfo('Enviamos um link de redefinição de senha para o seu e-mail.')
    } catch {
      setError('Não foi possível enviar o e-mail de redefinição.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <Card className="w-full max-w-sm">
        <p className="font-display text-xl font-semibold text-[var(--color-text)]">LeadDash</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Entre com sua conta para continuar.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]" htmlFor="email">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-muted)]" htmlFor="password">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
          {info && <p className="text-sm text-[var(--color-positive)]">{info}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="mt-4 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
        >
          Esqueci minha senha
        </button>
      </Card>
    </div>
  )
}
