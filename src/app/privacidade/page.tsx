import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0d0f0e', color: '#f5f7f4', padding: '48px 24px' }}>
      <article style={{ maxWidth: 820, margin: '0 auto', lineHeight: 1.7 }}>
        <Link href="/" style={{ color: '#c8ff3d', fontWeight: 800 }}>← Dash e Pipe</Link>
        <h1 style={{ fontSize: 44, letterSpacing: '-0.04em', marginBottom: 12 }}>Política de Privacidade</h1>
        <p style={{ color: '#aeb5ac' }}>Última atualização: 10 de setembro de 2026.</p>

        <h2>1. Sobre esta política</h2>
        <p>Esta Política de Privacidade explica como o Dash e Pipe trata informações necessárias para disponibilizar sua plataforma de organização de conversas, pipeline, indicadores e integrações com serviços de mensageria.</p>

        <h2>2. Dados que podem ser tratados</h2>
        <p>Conforme o uso da plataforma, podem ser tratados dados de cadastro da conta, informações do espaço de trabalho, dados técnicos de acesso e informações de conversas e contatos disponibilizadas por integrações autorizadas pelo próprio usuário.</p>

        <h2>3. Finalidades</h2>
        <p>Os dados são utilizados para autenticação, funcionamento da plataforma, organização de atendimentos, apresentação de indicadores, suporte, segurança, prevenção de abuso e execução das integrações configuradas pelo usuário.</p>

        <h2>4. Integrações com terceiros</h2>
        <p>Quando o usuário conecta serviços de terceiros, como soluções do WhatsApp Business fornecidas pela Meta, o tratamento também fica sujeito aos termos e políticas desses provedores. O Dash e Pipe utiliza apenas as autorizações necessárias para executar as funcionalidades solicitadas.</p>

        <h2>5. Compartilhamento</h2>
        <p>Não vendemos dados pessoais. Informações podem ser processadas por provedores de infraestrutura e integração estritamente para operação, segurança e disponibilidade do serviço, ou quando houver obrigação legal.</p>

        <h2>6. Segurança e retenção</h2>
        <p>Adotamos medidas técnicas e organizacionais compatíveis com a natureza do serviço. Os dados são mantidos pelo período necessário para prestação do serviço, cumprimento de obrigações legais e proteção contra fraude ou abuso.</p>

        <h2>7. Direitos e exclusão</h2>
        <p>O usuário pode solicitar acesso, correção ou exclusão de dados, quando aplicável. Consulte também a página de <Link href="/exclusao-de-dados" style={{ color: '#c8ff3d' }}>Exclusão de Dados</Link>.</p>

        <h2>8. Alterações</h2>
        <p>Esta política pode ser atualizada para refletir mudanças no produto, requisitos legais ou integrações. A versão vigente será publicada nesta página.</p>

        <p style={{ marginTop: 48, color: '#aeb5ac' }}>Para solicitações relacionadas à privacidade, utilize o canal de contato oficial informado no site do Dash e Pipe.</p>
      </article>
    </main>
  )
}
