import { getAppContext } from '@/lib/app-context'
import Link from 'next/link'

export default async function ExtensionPage() {
  const { tenantId, user, bootstrap } = await getAppContext()
  return <div className="page">
    <div className="page-head"><div><div className="page-eyebrow">WhatsApp Web · versão piloto</div><h1>Organização automática</h1><p>As conversas que você abre no WhatsApp podem chegar à Fluxolu enquanto você atende.</p></div></div>
    <section className="card card-pad" id="fluxolu-extension-context" data-tenant-id={tenantId} data-user-id={user.id} data-workspace-name={bootstrap.active_workspace?.name || 'Meu workspace'}>
      <h2>Conectar a extensão</h2>
      <ol><li>Instale ou atualize a extensão Fluxolu Companion no Chrome ou Edge.</li><li>Mantenha esta aba aberta e entre no WhatsApp Web no mesmo navegador.</li><li>Abra o painel da extensão e clique em “Ativar sincronização”. Confira o workspace antes de ativar.</li></ol>
      <p>A captura acompanha textos carregados da conversa individual aberta. Contatos e mensagens são organizados automaticamente, sem preencher fichas.</p>
      <p>Grupos, mídias, conversas não carregadas e histórico completo ainda não são sincronizados. Identificadores desconhecidos são ignorados para evitar misturar clientes. Os relatórios refletem somente os dados capturados.</p>
      <p>Deixe as duas abas abertas. Ao fechar o navegador, trocar a conta do WhatsApp ou sair da Fluxolu, pause a sincronização e ative novamente na conta correta. Não há envio automático de mensagens.</p>
      <a className="btn btn-primary" href="/fluxolu-extension.zip" download>Baixar extensão</a>{' '}
      <Link className="btn btn-secondary" href="/dashboard">Ver painel</Link>
    </section>
  </div>
}
