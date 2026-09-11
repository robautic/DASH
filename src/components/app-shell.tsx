'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/brand'
import { UiIcon } from '@/components/ui-icon'

const nav = [
  ['/dashboard', 'Dashboard', 'dashboard'],
  ['/pipeline', 'Pipeline', 'pipeline'],
  ['/conversas', 'Conversas', 'chat'],
  ['/conexoes', 'Conexões', 'link'],
  ['/configuracoes', 'Configurações', 'settings'],
] as const
const roles: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador',
}
export function AppShell({
  children,
  workspaceName,
  role,
  email,
}: {
  children: React.ReactNode
  workspaceName: string
  role: string
  email: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  async function signOut() {
    setSigningOut(true)
    setError('')
    try {
      const { error } = await createClient().auth.signOut()
      if (error) throw error
      router.replace('/login')
      router.refresh()
    } catch {
      setError('Não foi possível sair. Tente novamente.')
      setSigningOut(false)
    }
  }
  const initial = (email || workspaceName || 'D').slice(0, 1).toUpperCase()
  return (
    <div className="app-grid">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Brand />
          <span className="brand-beta">BETA</span>
        </div>
        <div>
          <p className="nav-caption">Seu workspace</p>
          <nav className="nav" aria-label="Navegação principal">
            {nav.map(([href, label, icon]) => (
              <Link
                href={href}
                key={href}
                data-active={pathname.startsWith(href)}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
                title={label}
              >
                <span className="nav-icon">
                  <UiIcon name={icon} />
                </span>
                <span className="nav-label">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <Link className="sidebar-tip" href="/pipeline">
          <UiIcon name="pipeline" size={24} />
          <strong>Cada conversa conta.</strong>
          <p>Organize as oportunidades e acompanhe o próximo resultado.</p>
        </Link>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-user-copy">
              <strong>{workspaceName}</strong>
              <span title={email}>{email}</span>
            </div>
          </div>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="sidebar-signout"
          >
            {signingOut ? 'Saindo…' : 'Sair da conta'}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
      <main className="main" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="topbar-left">
            <span className="workspace-name">{workspaceName}</span>
            <span className="role-pill">{roles[role] || role}</span>
          </div>
          <div className="topbar-tools">
            <Link
              className="topbar-link"
              href="/conversas"
              aria-label="Buscar nas conversas"
            >
              <UiIcon name="search" />
              <span>Buscar nas conversas</span>
            </Link>
            <Link
              className="topbar-link"
              href="/configuracoes"
              aria-label="Abrir configurações"
            >
              <UiIcon name="settings" />
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
