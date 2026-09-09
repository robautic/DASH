'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/components/brand'

const nav = [
  ['/dashboard', 'Dashboard', '◫'],
  ['/pipeline', 'Pipeline', '▥'],
  ['/conversas', 'Conversas', '◌'],
  ['/conexoes', 'Conexões', '⌁'],
  ['/configuracoes', 'Configurações', '⚙'],
] as const

export function AppShell({ children, workspaceName, role, email }: { children: React.ReactNode; workspaceName: string; role: string; email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <div className="app-grid">
      <aside className="sidebar">
        <Brand />
        <nav className="nav">
          {nav.map(([href, label, icon]) => (
            <Link href={href} key={href} data-active={pathname.startsWith(href)} title={label}>
              <span aria-hidden="true">{icon}</span> <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div>{email}</div>
          <button onClick={signOut} className="sidebar-signout">Sair</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div><span className="workspace-name">{workspaceName}</span> <span className="role-pill">{role}</span></div>
          <div className="status-dot"><span /> Supabase conectado</div>
        </header>
        {children}
      </main>
    </div>
  )
}
