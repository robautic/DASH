import Link from 'next/link'

export default function DataDeletionPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0d0f0e', color: '#f5f7f4', padding: '48px 24px' }}>
      <article style={{ maxWidth: 820, margin: '0 auto', lineHeight: 1.7 }}>
        <Link href="/" style={{ color: '#c8ff3d', fontWeight: 800 }}>← Fluxolu</Link>
        <h1 style={{ fontSize: 44, letterSpacing: '-0.04em', marginBottom: 12 }}>Exclusão de Dados</h1>
        <p style={{ color: '#aeb5ac' }}>Última atualização: 10 de setembro de 2026.</p>

        <p>Usuários da Fluxolu podem solicitar a exclusão de dados pessoais e dados associados à sua conta, observadas as hipóteses de retenção previstas em lei.</p>

        <h2>Como solicitar</h2>
        <p>Envie uma solicitação pelo canal oficial de contato informado no site da Fluxolu. Informe o e-mail utilizado na conta e descreva que deseja a exclusão dos dados associados ao serviço.</p>

        <h2>O que acontece depois</h2>
        <p>A solicitação será validada para proteger a conta contra pedidos indevidos. Após a confirmação, os dados elegíveis serão removidos ou anonimizados conforme aplicável. Alguns registros podem ser mantidos pelo período necessário para cumprimento de obrigações legais, segurança e prevenção de fraude.</p>

        <h2>Integrações</h2>
        <p>Desconectar uma integração impede novos acessos pela Fluxolu. Dados mantidos diretamente por serviços de terceiros, como a Meta e o WhatsApp Business, devem ser tratados também conforme as políticas e ferramentas desses provedores.</p>

        <p style={{ marginTop: 48 }}><Link href="/privacidade" style={{ color: '#c8ff3d' }}>Consulte a Política de Privacidade</Link> para mais informações sobre o tratamento de dados.</p>
      </article>
    </main>
  )
}
