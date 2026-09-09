# Dash e Pipe

SaaS para transformar o WhatsApp em uma operação organizada com **Conversas, Pipeline e Dashboard**.

## Stack

- Next.js 16 + React 19
- Supabase Auth + SSR
- Postgres/RLS/RPCs
- Supabase Realtime
- Supabase Edge Functions
- WhatsApp Cloud API
- Vercel

## Produto

Fluxo principal: **Conectar → Visualizar → Organizar → Acompanhar → Analisar**.

Áreas do app:

- Dashboard
- Pipeline
- Conversas
- Conexões
- Configurações

O visual premium usa tema grafite com destaque lime, inspirado em dashboards SaaS modernos sem copiar uma interface específica.

## WhatsApp Business

Há dois modos de conexão:

1. **Embedded Signup da Meta** — recomendado. O frontend abre o SDK da Meta e envia apenas o código temporário e os IDs retornados para a Edge Function `whatsapp-embedded-signup`.
2. **Configuração avançada manual** — fallback para administradores, usando a Edge Function `whatsapp-configure`.

O token final nunca é persistido no navegador; ele é armazenado no Vault pelo backend.

### Variáveis públicas do frontend

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_META_APP_ID=
NEXT_PUBLIC_META_CONFIG_ID=
```

### Secrets da Edge Function

Configure no Supabase Dashboard:

```text
META_APP_ID
META_APP_SECRET
WHATSAPP_GRAPH_API_VERSION=v25.0
```

Também é necessário liberar a URL pública do app em **Supabase Auth → URL Configuration** e configurar o aplicativo Meta/Embedded Signup.

## Extensão Chrome / Edge

O diretório [`extension/`](./extension) contém o MVP da extensão companion.

Ela:

- aparece no WhatsApp Web;
- tenta identificar o nome/telefone do chat aberto sem automatizar envio de mensagens;
- abre o Dash e Pipe em `Conversas` já com a busca preenchida;
- usa o Side Panel do navegador;
- permite configurar a URL do ambiente do Dash e Pipe.

Para testar localmente, abra `chrome://extensions`, habilite o modo de desenvolvedor e use **Carregar sem compactação** apontando para a pasta `extension`.

## Segurança

- RLS é a fonte de verdade para isolamento multi-tenant.
- `service_role`, App Secret da Meta e tokens de WhatsApp não devem usar prefixo `NEXT_PUBLIC_`.
- Estado de leitura interno de cada atendente é separado do status de entrega/leitura do provedor WhatsApp.

## Desenvolvimento

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```
