import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ComingSoon } from '@/components/ComingSoon'
import { PageSkeleton } from '@/components/PageSkeleton'
import { LoginPage } from '@/pages/login/LoginPage'
import { ProtectedRoute } from './ProtectedRoute'
import { AppShell } from './AppShell'

// Code-splitting por rota: cada página operacional vira um chunk separado,
// baixado só quando o usuário navega até ela — requisito explícito do spec
// ("code splitting", "não carregar todas as coleções na abertura do
// dashboard"). LoginPage fica fora do lazy() de propósito: é a primeira
// tela que qualquer usuário vê, então carregá-la eager evita um round-trip
// extra de chunk antes do primeiro paint.
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LeadsPage = lazy(() => import('@/pages/leads/LeadsPage').then(m => ({ default: m.LeadsPage })))
const LeadDetailPage = lazy(() => import('@/pages/lead-detail/LeadDetailPage').then(m => ({ default: m.LeadDetailPage })))
const AtendentesPage = lazy(() => import('@/pages/atendentes/AtendentesPage').then(m => ({ default: m.AtendentesPage })))
const AtendenteDetailPage = lazy(() => import('@/pages/atendente-detail/AtendenteDetailPage').then(m => ({ default: m.AtendenteDetailPage })))
const SupervisoresPage = lazy(() => import('@/pages/supervisores/SupervisoresPage').then(m => ({ default: m.SupervisoresPage })))
const CampanhasPage = lazy(() => import('@/pages/campanhas/CampanhasPage').then(m => ({ default: m.CampanhasPage })))
const ConversoesPage = lazy(() => import('@/pages/conversoes/ConversoesPage').then(m => ({ default: m.ConversoesPage })))
const MetasPage = lazy(() => import('@/pages/metas/MetasPage').then(m => ({ default: m.MetasPage })))
const AuditoriaPage = lazy(() => import('@/pages/auditoria/AuditoriaPage').then(m => ({ default: m.AuditoriaPage })))
const RelatoriosPage = lazy(() => import('@/pages/relatorios/RelatoriosPage').then(m => ({ default: m.RelatoriosPage })))
const ConfiguracoesPage = lazy(() => import('@/pages/configuracoes/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })))

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

// Todas as 13 telas operacionais do spec estão ligadas agora (Fases 5-7).
// Usuários/Departamentos ficam como placeholder — CRUD de usuário já existe
// na API (Fase 4/7) mas não tem tela própria ainda; ficou fora do escopo
// pedido nas Fases 1-7.
export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<LazyPage><DashboardPage /></LazyPage>} />
        <Route path="/leads" element={<LazyPage><LeadsPage /></LazyPage>} />
        <Route path="/leads/:id" element={<LazyPage><LeadDetailPage /></LazyPage>} />
        <Route path="/atendentes" element={<LazyPage><AtendentesPage /></LazyPage>} />
        <Route path="/atendentes/:id" element={<LazyPage><AtendenteDetailPage /></LazyPage>} />
        <Route path="/supervisores" element={<LazyPage><SupervisoresPage /></LazyPage>} />
        <Route path="/campanhas" element={<LazyPage><CampanhasPage /></LazyPage>} />
        <Route path="/conversoes" element={<LazyPage><ConversoesPage /></LazyPage>} />
        <Route path="/relatorios" element={<LazyPage><RelatoriosPage /></LazyPage>} />
        <Route path="/metas" element={<LazyPage><MetasPage /></LazyPage>} />
        <Route path="/auditoria" element={<LazyPage><AuditoriaPage /></LazyPage>} />
        <Route path="/usuarios" element={<ComingSoon title="Usuários" />} />
        <Route path="/departamentos" element={<ComingSoon title="Departamentos" />} />
        <Route path="/configuracoes" element={<LazyPage><ConfiguracoesPage /></LazyPage>} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
