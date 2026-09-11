import { AppShell } from '@/components/app-shell'
import { getAppContext } from '@/lib/app-context'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { bootstrap, user } = await getAppContext()
  return (
    <AppShell
      workspaceName={bootstrap.active_workspace?.name || 'Meu workspace'}
      role={bootstrap.active_workspace?.role || 'member'}
      email={bootstrap.profile?.email || user.email || ''}
    >
      {children}
    </AppShell>
  )
}
