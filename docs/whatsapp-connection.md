# Conectar o WhatsApp Business à Fluxolu

Para manter o número já usado no celular, use **Conexões → Usar o mesmo WhatsApp Business**. A Meta define a elegibilidade do número e as etapas disponíveis durante a autorização. Não escolha número dedicado à API se pretende continuar usando o aplicativo.

## Ativação da integração

1. No aplicativo empresarial da Meta, configure o WhatsApp e o Facebook Login for Business / Embedded Signup para onboarding de usuários do WhatsApp Business App.
2. Cadastre o domínio público da Fluxolu, a política de privacidade e os demais URLs exigidos no painel da Meta.
3. Na Vercel, configure NEXT_PUBLIC_META_APP_ID e NEXT_PUBLIC_META_CONFIG_ID no ambiente Production. São identificadores públicos; precisam pertencer à mesma integração.
4. No Supabase, configure META_APP_ID e META_APP_SECRET nos secrets da função whatsapp-embedded-signup. Nunca coloque o segredo em NEXT_PUBLIC_* ou no repositório.
5. Confira o webhook da Meta e suas assinaturas. Publicar novamente a aplicação é necessário depois de alterar as variáveis NEXT_PUBLIC_*.
6. Conclua as permissões, verificações e revisões que a Meta solicitar para o aplicativo e a empresa.

## Conexão pelo proprietário do número

1. Entre na Fluxolu com acesso de administrador ao workspace.
2. Tenha o WhatsApp Business atualizado no celular e acesso administrativo à conta empresarial da Meta.
3. Em Conexões, escolha Conectar meu WhatsApp Business.
4. Autorize pela janela da Meta, selecione o número existente e confirme no celular conforme as instruções exibidas.
5. Confira a conexão na lista de números. Depois teste recebimento e envio com um contato de teste autorizado.

Se aparecer Configuração pendente, faltam os identificadores públicos no build atual. Se a Meta não carregar, confira rede, pop-ups e bloqueadores de conteúdo. Falhas de autorização, sessão expirada e ativação do webhook são exibidas com instruções próprias.

## Verificação desta alteração

- Função whatsapp-embedded-signup encontrada ativa (versão 2).
- A publicação existente não possuía variáveis de ambiente na inspeção inicial; nenhuma credencial Meta foi inventada.
- O aplicativo só confirma sucesso após a função retornar ok e status connected.
- Respostas duplicadas da Meta não repetem a troca do código na mesma tentativa.
- Cancelamento, origem de mensagens, ordem dos callbacks e erro HTTP devem ser cobertos pelos testes.
- Autorizar o número e testar tráfego real exigem a conta Meta e o celular do titular.

Documentação: https://developers.facebook.com/docs/whatsapp/embedded-signup/custom-flows/onboarding-business-app-users/
Tratamento de erros: https://supabase.com/docs/guides/functions/error-handling
