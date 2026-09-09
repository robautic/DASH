import { AuthShell } from '@/components/auth-shell'
import { RecoveryForm } from '@/components/recovery-form'

export default function RecoveryPage() {
  return <AuthShell><div className="auth-card"><h2>Recuperar senha</h2><p className="sub">Enviaremos um link seguro para seu e-mail.</p><RecoveryForm /></div></AuthShell>
}
