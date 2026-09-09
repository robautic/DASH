import { Brand } from '@/components/brand'

export function AuthShell({children}:{children:React.ReactNode}){
  return <main className="auth-page"><section className="auth-hero"><Brand/><div><div className="page-eyebrow">WhatsApp → operação</div><h1>Organize conversas. <em>Enxergue o resultado.</em></h1><p>Atendimento, pipeline e indicadores em um único lugar — sem transformar sua rotina em um CRM pesado.</p></div><small style={{color:'#666b70'}}>Conectar → Visualizar → Organizar → Acompanhar → Analisar</small></section><section className="auth-panel">{children}</section></main>
}
