import { Suspense } from 'react'
import { AuthShell } from '@/components/auth-shell'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <AuthShell>
      <div className="auth-card">
        <h2>Entrar</h2>
        <p className="sub">Acesse sua operação do WhatsApp.</p>
        <Suspense fallback={<div className="muted">Carregando…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </AuthShell>
  )
}
