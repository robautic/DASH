# Dash e Pipe

**Transforme seu WhatsApp em uma operação organizada, com Pipeline e Dashboard.**

Dash e Pipe não é um CRM tradicional. A experiência é centrada no fluxo **Conectar → Visualizar → Organizar → Acompanhar → Analisar**.

## Stack

- Next.js 16 + React 19 + TypeScript
- Supabase Auth + PostgreSQL + RLS
- Supabase Realtime
- Supabase Edge Functions
- Supabase Vault
- WhatsApp Cloud API
- Deploy recomendado: Vercel

## Áreas

- Dashboard com KPIs, série diária e filtros
- Pipeline Kanban com drag-and-drop
- Conversas com mensagens em tempo real, tags e responsáveis
- Conexões WhatsApp
- Configurações de workspace, equipe, pipeline e tags
- Onboarding e autenticação

## Rodar localmente

```bash
cp .env.example .env.local
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis

O frontend usa apenas a URL pública do projeto e a **publishable key**. Não coloque service role, secret key ou tokens da Meta no browser.

```env
NEXT_PUBLIC_SUPABASE_URL=https://ikgzyoltuiiwkrnjznml.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Secrets do WhatsApp ficam nas Edge Functions/Vault do Supabase.

## Backend Supabase já esperado

O app utiliza RPCs existentes como `get_app_bootstrap`, `get_dashboard_summary_filtered`, `get_dashboard_daily_series_filtered`, `get_pipeline_board_filtered`, `list_conversations_filtered`, `get_conversation_messages`, `move_pipeline_item`, `assign_conversation`, `set_conversation_tags`, `get_connection_health`, `get_workspace_settings`, `get_workspace_members` e demais funções de configuração.

Também utiliza as Edge Functions `whatsapp-configure`, `whatsapp-send` e `workspace-invite`.

## Deploy na Vercel

1. Importe este repositório na Vercel.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Defina `NEXT_PUBLIC_APP_URL` com a URL final.
4. No Supabase Auth, adicione a URL da Vercel às Redirect URLs.
5. Faça o deploy.

## Segurança

- RLS é a fonte de autorização do banco.
- Flags de permissão do frontend servem apenas para UX.
- Tokens WhatsApp nunca devem ir para variáveis `NEXT_PUBLIC_*`.
- O access token digitado na tela de Conexões é enviado para uma Edge Function autenticada e deve ser armazenado pelo backend no Vault.

## Branch de implementação

A reconstrução atual está em `dash-e-pipe` para preservar o projeto legado existente em `main`.
