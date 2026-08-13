// Contexto de autenticação: escuta o Firebase Auth (onAuthStateChanged),
// busca o perfil/role em GET /api/me quando há um usuário logado, e expõe
// login/logout pro resto do app. Nenhuma outra tela deve chamar
// getAuth()/signInWithEmailAndPassword() direto — tudo passa por aqui.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { apiClient, ApiError } from '@/lib/apiClient'
import type { AuthUser } from '@/types/auth'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  profile: AuthUser | null
  loading: boolean
  /** Erro ao carregar o perfil (ex.: autenticado no Firebase mas sem acesso provisionado no LeadDash). */
  profileError: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      setProfileError(null)

      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const me = await apiClient.get<AuthUser>('/api/me')
        setProfile(me)
      } catch (err) {
        setProfile(null)
        setProfileError(
          err instanceof ApiError ? err.message : 'Não foi possível carregar seu perfil no LeadDash',
        )
      } finally {
        setLoading(false)
      }
    })
  }, [])

  const value: AuthContextValue = {
    firebaseUser,
    profile,
    loading,
    profileError,
    login: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    logout: () => signOut(auth),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
