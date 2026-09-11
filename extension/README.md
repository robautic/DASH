# Fluxolu Companion

Extensão Manifest V3 para Chrome e Edge.

## Sincronização automática (0.2.0 · piloto)

1. Baixe `/fluxolu-extension.zip` na Fluxolu, extraia e carregue a pasta no Chrome/Edge em modo de desenvolvedor.
2. Recarregue WhatsApp Web e Fluxolu após instalar/atualizar.
3. Abra exatamente uma aba `https://dash-e-pipe.vercel.app/extensao` autenticada e uma aba WhatsApp Web no mesmo navegador.
4. Na extensão, clique em **Conferir workspace**, confira o destino e clique em **Ativar sincronização**.
5. Abra uma conversa individual: textos carregados compatíveis passam a ser enviados automaticamente. Veja o estado e o horário do último envio no painel da extensão.

Não precisa de VPS, Evolution nem configuração Meta para este modo. As duas abas precisam continuar abertas e a sessão da Fluxolu precisa estar válida. A extensão usa uma ponte na aba autenticada; não armazena senha ou token do WhatsApp/Supabase.

A captura acompanha mudanças da página (até cerca de 1 segundo após uma mudança, mais o tempo de rede), com verificação periódica de 5 segundos. O painel acompanha eventos do banco e tem recuperação por atualização de 30 segundos enquanto visível. Isso não constitui garantia de latência: o navegador pode limitar abas em segundo plano.

### Limites e operação

- Apenas textos renderizados de conversas individuais com identidade estável e data reconhecida (pt, pt-BR, pt-PT, en-US, en-GB). Não abre conversas nem percorre o histórico automaticamente.
- Grupos, mídias, mensagens não carregadas, exclusões e edições não são sincronizados nesta versão.
- Identificadores `@lid` não são tratados como números telefônicos; nunca se une um contato somente pelo nome.
- Mensagens são deduplicadas por empresa e identificador externo; contatos desta origem não são fundidos com os de outras integrações.
- A fila guarda até 500 mensagens no armazenamento de sessão da extensão. Sobrevive à suspensão do processo da extensão, mas não ao fechamento do navegador. Pausar ou fechar uma das abas descarta a fila. Reabra as conversas para recapturar textos ainda disponíveis.
- Pause antes de trocar a conta do WhatsApp e confira o workspace ao reativar. A leitura do DOM não confirma a identidade da conta conectada ao WhatsApp.
- Falha de autenticação ou permissão pausa o envio; a empresa vinculada nunca é substituída automaticamente.
- Estatísticas cobrem apenas a captura disponível. Receita e vendas dependem de registros confirmados no pipeline.
- A estrutura do WhatsApp Web pode mudar. Os seletores ainda precisam de teste real na conta do usuário; não há garantia de cobertura completa.

## Atalhos existentes

- adiciona um atalho flutuante no WhatsApp Web;
- abre um Side Panel;
- tenta identificar nome/telefone do chat aberto;
- abre `/conversas?search=...` na Fluxolu;
- permite trocar a URL do ambiente pelo próprio painel.

A extensão **não automatiza envio de mensagens** e não manipula o token do WhatsApp.

## Testar

1. Abra `chrome://extensions` (ou `edge://extensions`).
2. Ative o modo de desenvolvedor.
3. Clique em **Carregar sem compactação**.
4. Selecione esta pasta `extension`.
5. Recarregue o WhatsApp Web.

O reconhecimento pode precisar de ajustes caso o WhatsApp altere o DOM. A integração oficial via Cloud API é independente desta captura.
