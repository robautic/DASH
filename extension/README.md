# Dash e Pipe Companion

Extensão Manifest V3 para Chrome e Edge.

## O que faz

- adiciona um atalho flutuante no WhatsApp Web;
- abre um Side Panel;
- tenta identificar nome/telefone do chat aberto;
- abre `/conversas?search=...` no Dash e Pipe;
- permite trocar a URL do ambiente pelo próprio painel.

A extensão **não automatiza envio de mensagens** e não manipula o token do WhatsApp.

## Testar

1. Abra `chrome://extensions` (ou `edge://extensions`).
2. Ative o modo de desenvolvedor.
3. Clique em **Carregar sem compactação**.
4. Selecione esta pasta `extension`.
5. Recarregue o WhatsApp Web.

O reconhecimento do contato é deliberadamente leve e pode precisar de ajustes caso o WhatsApp altere o DOM. A operação principal continua sendo feita pela Cloud API no backend.
