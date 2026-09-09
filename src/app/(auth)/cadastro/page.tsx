import { AuthShell } from '@/components/auth-shell'
import { SignupForm } from '@/components/signup-form'

export default function SignupPage() {
  return <AuthShell><div className="auth-card"><h2>Criar conta</h2><p className="sub">Seu workspace e pipeline inicial são criados automaticamente.</p><SignupForm /></div></AuthShell>
}
