import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#0d0f0e', color: '#f5f7f4' }}>
      <header style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em' }}>Fluxolu</div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14 }}>
          <a href="#recursos">Recursos</a>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/login" style={{ background: '#c8ff3d', color: '#111', padding: '10px 16px', borderRadius: 999, fontWeight: 800 }}>Entrar</Link>
        </nav>
      </header>

      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '92px 24px 72px' }}>
        <div style={{ display: 'inline-flex', border: '1px solid #30352f', borderRadius: 999, padding: '8px 12px', color: '#b9c0b7', fontSize: 13, marginBottom: 26 }}>
          Operação organizada para WhatsApp Business
        </div>
        <h1 style={{ maxWidth: 900, fontSize: 'clamp(48px, 8vw, 92px)', lineHeight: .94, letterSpacing: '-0.065em', margin: 0 }}>
          Transforme seu WhatsApp em uma operação organizada.
        </h1>
        <p style={{ maxWidth: 720, color: '#aeb5ac', fontSize: 20, lineHeight: 1.6, margin: '28px 0 34px' }}>
          Centralize conversas, acompanhe atendimentos em um pipeline e visualize indicadores importantes em um único lugar.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/cadastro" style={{ background: '#c8ff3d', color: '#111', padding: '14px 20px', borderRadius: 14, fontWeight: 850 }}>Criar conta</Link>
          <Link href="/login" style={{ border: '1px solid #333833', padding: '14px 20px', borderRadius: 14, fontWeight: 750 }}>Acessar plataforma</Link>
        </div>
      </section>

      <section id="recursos" style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 24px 84px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {[
          ['Conversas', 'Organize atendimentos do WhatsApp em uma caixa de entrada centralizada.'],
          ['Pipeline', 'Acompanhe cada conversa por etapa e mantenha a operação visível para a equipe.'],
          ['Dashboard', 'Analise volume, andamento e desempenho com indicadores da operação.'],
          ['Integrações', 'Conecte o WhatsApp Business por meio das soluções oficiais da Meta.'],
        ].map(([title, text]) => (
          <article key={title} style={{ background: '#151815', border: '1px solid #292d29', borderRadius: 24, padding: 26 }}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>{title}</h2>
            <p style={{ color: '#aeb5ac', lineHeight: 1.6, marginBottom: 0 }}>{text}</p>
          </article>
        ))}
      </section>

      <footer style={{ borderTop: '1px solid #242824' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 18, color: '#929991', fontSize: 13 }}>
          <span>© {new Date().getFullYear()} Fluxolu.</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Link href="/privacidade">Política de Privacidade</Link>
            <Link href="/termos">Termos de Uso</Link>
            <Link href="/exclusao-de-dados">Exclusão de Dados</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
