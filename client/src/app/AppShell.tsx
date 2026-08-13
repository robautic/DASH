// Layout das telas autenticadas: sidebar de navegação + topbar com o usuário
// atual. As telas em si (Outlet) só cuidam do próprio conteúdo.
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/Button'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leads', label: 'Leads' },
  { to: '/atendentes', label: 'Atendentes' },
  { to: '/supervisores', label: 'Supervisores' },
  { to: '/campanhas', label: 'Campanhas' },
  { to: '/conversoes', label: 'Conversões' },
  { to: '/relatorios', label: 'Relatórios' },
  { to: '/metas', label: 'Metas' },
  { to: '/auditoria', label: 'Auditoria' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/departamentos', label: 'Departamentos' },
  { to: '/configuracoes', label: 'Configurações' },
]

export function AppShell() {
  const { profile, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <aside className="flex w-56 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="px-4 py-5">
          <p className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)]">LeadDash</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--color-border)] p-3">
          <p className="truncate text-xs text-[var(--color-text-muted)]">{profile?.email}</p>
          <p className="mt-0.5 text-xs font-mono-nums text-[var(--color-accent)]">{profile?.role}</p>
          <Button variant="ghost" className="mt-2 w-full" onClick={() => logout()}>
            Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
