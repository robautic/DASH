# Validação da sincronização piloto — 11/09/2026

Fluxo: WhatsApp Web renderizado → content script → fila da extensão → aba Fluxolu autenticada → API → RPC com autorização por empresa → contatos/conversas/mensagens → atualização do painel.

## Evidências

- `node --test tests/extension-sync.test.mjs tests/whatsapp-onboarding.test.mjs`: 15 casos aprovados (captura simulada, idiomas/datas, IDs, grupos, fila, reenvio, duplicação e mudança de sessão).
- `tests/extension-sync.sql` executado no banco real dentro de transação desfeita: ingestão como usuário autenticado, idempotência, identidade do contato, ordem cronológica, isolamento de empresa, rejeição de telefone inconsistente e de sessão ausente. Nenhum registro de teste foi mantido.
- Entrada da API exige origem igual à da aplicação, cabeçalho específico, sessão validada no servidor e usuário igual ao da ativação.
- A RPC pública é invoker; a rotina privada privilegiada tem verificação explícita de sessão e papel na empresa. Execução anônima foi revogada. Políticas RLS existentes não foram ampliadas.
- O verificador de segurança do Supabase não encontrou problema novo de RLS. Permanece o aviso da configuração de [proteção contra senhas vazadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

- Interface da extensão verificada em navegador isolado, com APIs Chrome simuladas: ativação desabilitada até conferir workspace, ativação e pausa funcionando.
- Lint, TypeScript e compilação Next.js aprovados. Pacote ZIP validado contra os arquivos atuais.

## Ainda não comprovado

- Seletores e formato de mensagens em uma conta real do WhatsApp Web.
- Sincronização real com o navegador do usuário e latência em segundo plano.
- Histórico completo, grupos, mídias, edição/exclusão e troca de identidade da conta WhatsApp não fazem parte desta versão.

## Webhook oficial (independente)

Callback: `https://ikgzyoltuiiwkrnjznml.supabase.co/functions/v1/whatsapp-webhook`.

O GET de diagnóstico retornou 503: falta `WHATSAPP_VERIFY_TOKEN`. O POST verifica HMAC com `WHATSAPP_APP_SECRET`. Configure ambos em Supabase → Edge Functions → Secrets; o token de verificação deve ser igual na Meta. O App Secret pertence ao aplicativo Meta `1835677577844247`, informado pelo usuário. Nunca incluir segredos no repositório.

Após validar o callback, assine o campo `messages`, publique o aplicativo na Meta conforme os requisitos exibidos no painel e conecte a conta WhatsApp à empresa correspondente na Fluxolu. Verificar callback não basta: eventos com número não vinculado são ignorados pelo backend. Não ativar certificado de cliente (mTLS) sem implementar essa modalidade; o receptor atual verifica a assinatura HMAC.

O CLI Supabase não está autenticado para configurar segredos; o conector disponível não expõe essa operação. Essa parte depende do cadastro pelo administrador. Não foi alterado o segredo do app nem desativada a validação de assinatura.
