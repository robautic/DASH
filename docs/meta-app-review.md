# Meta App Review — Fluxolu

Este documento organiza a preparação técnica e a gravação da evidência para a análise do app da Meta.

## Objetivo da demonstração

Mostrar, em um único fluxo contínuo, que a Fluxolu usa a Plataforma do WhatsApp Business para:

1. conectar uma conta/número autorizado;
2. visualizar conversas recebidas por webhook;
3. enviar uma mensagem pelo WhatsApp;
4. listar modelos de mensagem da conta;
5. criar um modelo e enviá-lo para análise da Meta;
6. mostrar o status retornado pela própria API.

## Funcionalidades que devem estar ativas antes da gravação

- Embedded Signup configurado e liberado no app da Meta;
- `NEXT_PUBLIC_META_APP_ID` e `NEXT_PUBLIC_META_CONFIG_ID` configurados no frontend;
- `META_APP_ID` e `META_APP_SECRET` configurados somente nos secrets do Supabase;
- Edge Function `whatsapp-embedded-signup` ativa;
- Edge Function `whatsapp-send` ativa;
- Edge Function `whatsapp-templates` ativa;
- webhook da WABA inscrito;
- pelo menos um número de teste ou número autorizado conectado;
- uma conversa de teste disponível no workspace.

## Roteiro sugerido para o vídeo

### 1. Identificação do produto

Abrir a landing page pública da Fluxolu e mostrar rapidamente o nome do produto e sua finalidade.

### 2. Login

Entrar no ambiente de demonstração com uma conta de teste preparada para a análise.

### 3. Conexão do WhatsApp

Abrir **Conexões** e mostrar o número conectado. Se a Meta exigir a demonstração do onboarding, iniciar o Embedded Signup e mostrar o fluxo oficial sem revelar tokens ou secrets.

### 4. Conversas e envio

Abrir **Conversas**, selecionar uma conversa de teste e enviar uma mensagem. Em seguida, mostrar que a mensagem aparece na conversa e que o envio foi realizado pela integração oficial.

### 5. Gerenciamento de modelos

Abrir **Conexões → Gerenciar modelos**.

Mostrar a lista de modelos retornada pela Meta. Depois criar um modelo simples de teste, por exemplo:

- Nome: `confirmacao_atendimento`
- Categoria: `UTILITY`
- Idioma: `pt_BR`
- Corpo: `Olá! Seu atendimento foi confirmado.`

Enviar o modelo para análise e mostrar a confirmação da Fluxolu. Atualizar a lista e mostrar o status retornado pela Meta quando disponível.

### 6. Encerramento

Mostrar novamente o Dashboard ou a tela de Conversas para deixar claro que o gerenciamento do WhatsApp faz parte do produta Fluxolu e não é uma ferramenta isolada.

## Cuidados na gravação

- Não mostrar App Secret, access tokens, service-role keys ou valores do Vault.
- Não editar o vídeo de forma que esconda etapas importantes do fluxo.
- Use apenas dados de teste ou dados que possam ser mostrados à equipe de revisão.
- O nome do app mostrado na Meta deve ser consistente com o produto apresentado.
- A URL pública usada na revisão deve estar acessível sem VPN ou rede privada.

## URLs públicas necessárias

Manter publicamente acessíveis antes do envio:

- `/` — landing page;
- `/privacidade` — Política de Privacidade;
- `/termos` — Termos de Uso;
- `/exclusao-de-dados` — instruções de exclusão de dados.

## Estado atual

A verificação empresarial da Meta está em análise. A submissão final da App Review deve ocorrer somente quando a Meta liberar a etapa e quando o fluxo real estiver validado de ponta a ponta.
