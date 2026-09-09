import { Brand } from '@/components/brand'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-hero">
        <Brand />
        <div>
          <h1>Seu WhatsApp virou operação.</h1>
          <p>Visualize conversas, organize oportunidades no pipeline e acompanhe resultados sem transformar sua rotina em um CRM pesado.</p>
        </div>
        <small style={{ color: '#7f879e' }}>Conectar → Visualizar → Organizar → Acompanhar → Analisar</small>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  )
}
