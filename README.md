# Dash e Pipe

SaaS para transformar o WhatsApp em uma operação organizada com Conversas, Pipeline e Dashboard.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth + SSR
- Supabase Postgres / RLS / Realtime
- Supabase Edge Functions
- WhatsApp Cloud API / Embedded Signup

## Módulos

- Dashboard
- Pipeline
- Conversas
- Conexões
- Configurações

## WhatsApp

O Dash e Pipe oferece três caminhos de conexão:

1. **Coexistência — recomendado**: para empresas que já usam o WhatsApp Business App e querem manter o mesmo número no celular enquanto conectam a operação ao Dash e Pipe.
2. **Cloud API dedicada**: para números destinados principalmente à operação via plataforma/API.
3. **Configuração manual avançada**: fallback técnico com Phone Number ID, Business Account ID e Access Token.

O Embedded Signup usa `NEXT_PUBLIC_META_APP_ID` e `NEXT_PUBLIC_META_CONFIG_ID` no frontend. O `META_APP_SECRET` deve permanecer somente nos secrets do Supabase. Tokens de WhatsApp são armazenados no backend/Vault e nunca em variáveis `NEXT_PUBLIC_*`.

A Edge Function `whatsapp-embedded-signup` recebe o código retornado pela Meta, valida o número, assina os webhooks da WABA, armazena a credencial e registra o modo da conexão (`coexistence` ou `cloud_api`).

A tela de Conexões consulta `get_connection_health_v2`, que expõe o modo de cada número apenas para usuários autenticados do workspace.

## Extensão Chrome/Edge

A pasta `extension/` contém a companion extension do Dash e Pipe. Ela adiciona um painel lateral ao WhatsApp Web para abrir o contato/conversa correspondente no sistema. A extensão é interface complementar e não automatiza envio de mensagens pela interface do WhatsApp Web.

## Ambiente

Copie `.env.example` para `.env.local` e configure as variáveis públicas necessárias. Nunca coloque chaves secretas do Supabase ou App Secret da Meta no frontend.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Validação

```bash
npm run typecheck
npm run lint
npm run build
```
