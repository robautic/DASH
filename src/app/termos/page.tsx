import Link from 'next/link'

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0d0f0e', color: '#f5f7f4', padding: '48px 24px' }}>
      <article style={{ maxWidth: 820, margin: '0 auto', lineHeight: 1.7 }}>
        <Link href="/" style={{ color: '#c8ff3d', fontWeight: 800 }}>← Dash e Pipe</Link>
        <h1 style={{ fontSize: 44, letterSpacing: '-0.04em', marginBottom: 12 }}>Termos de Uso</h1>
        <p style={{ color: '#aeb5ac' }}>Última atualização: 10 de setembro de 2026.</p>

        <h2>1. Serviço</h2>
        <p>O Dash e Pipe é uma plataforma de organização operacional que reúne conversas, pipeline, indicadores e integrações autorizadas com serviços de mensageria.</p>

        <h2>2. Conta e acesso</h2>
        <p>O usuário é responsável pelas informações fornecidas no cadastro, pela segurança de suas credenciais e pelas atividades realizadas em sua conta e espaço de trabalho.</p>

        <h2>3. Uso permitido</h2>
        <p>A plataforma deve ser utilizada de forma lícita e em conformidade com as regras dos serviços integrados. É proibido utilizar o Dash e Pipe para fraude, abuso, envio não autorizado de mensagens ou violação de direitos de terceiros.</p>

        <h2>4. WhatsApp Business e serviços de terceiros</h2>
        <p>Funcionalidades relacionadas ao WhatsApp dependem das soluções oficiais disponibilizadas pela Meta e das permissões concedidas pelo usuário. Alterações, indisponibilidades ou restrições aplicadas por terceiros podem afetar determinadas funcionalidades.</p>

        <h2>5. Dados e conteúdo</h2>
        <p>O usuário permanece responsável pelo conteúdo e pelos dados que insere ou conecta à plataforma e deve possuir as autorizações e bases legais necessárias para tratá-los.</p>

        <h2>6. Disponibilidade</h2>
        <p>Buscamos manter o serviço disponível e seguro, mas podem ocorrer interrupções por manutenção, falhas técnicas, serviços de terceiros ou eventos fora de nosso controle.</p>

        <h2>7. Encerramento</h2>
        <p>O acesso pode ser encerrado pelo usuário ou suspenso em caso de uso incompatível com estes termos, riscos de segurança ou exigência legal.</p>

        <h2>8. Privacidade</h2>
        <p>O tratamento de dados pessoais é descrito na <Link href="/privacidade" style={{ color: '#c8ff3d' }}>Política de Privacidade</Link>.</p>

        <p style={{ marginTop: 48, color: '#aeb5ac' }}>Ao utilizar o Dash e Pipe, o usuário declara estar de acordo com estes Termos de Uso.</p>
      </article>
    </main>
  )
}
