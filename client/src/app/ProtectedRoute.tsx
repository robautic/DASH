import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, profile, loading, profileError } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <Spinner />
      </div>
    )
  }

  if (!firebaseUser) return <Navigate to="/login" replace />

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 text-center">
        <div>
          <p className="font-display text-lg text-[var(--color-text)]">Acesso não provisionado</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {profileError ?? 'Sua conta ainda não tem uma role definida no LeadDash. Fale com um administrador.'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
