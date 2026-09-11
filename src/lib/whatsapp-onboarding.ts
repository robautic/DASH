const messages: Record<string, string> = {
  meta_app_not_configured:
    'A conexão oficial precisa ser ativada pelo administrador da Fluxolu.',
  server_configuration_error:
    'A configuração do serviço de conexão está incompleta. Contate o administrador.',
  meta_code_exchange_failed:
    'A autorização da Meta expirou. Inicie uma nova conexão.',
  meta_phone_validation_failed:
    'A Meta não validou este número. Confira se escolheu o WhatsApp Business correto.',
  meta_webhook_subscription_failed:
    'O número foi autorizado, mas o recebimento de mensagens não foi ativado. Tente novamente.',
  forbidden: 'Você não tem acesso para conectar um número neste workspace.',
  admin_required:
    'Peça a um administrador ou proprietário do workspace para conectar o número.',
  invalid_session: 'Sua sessão expirou. Entre novamente na Fluxolu.',
  unauthorized: 'Entre novamente na Fluxolu para conectar seu WhatsApp.',
  evolution_not_configured:
    'O servidor da conexão por QR Code ainda não foi configurado.',
}
export async function connectionError(
  error: unknown,
  data?: unknown,
): Promise<string> {
  let body = data as { error?: string } | undefined
  let status = 0
  if (
    error &&
    typeof error === 'object' &&
    'context' in error &&
    error.context instanceof Response
  ) {
    status = error.context.status
    try {
      body = await error.context.clone().json()
    } catch {
      /* Non-JSON gateway response. */
    }
  }
  if (body?.error && messages[body.error]) return messages[body.error]
  if (status === 401) return messages.invalid_session
  if (status === 403) return messages.forbidden
  return 'Não foi possível concluir a conexão. Confira sua internet e tente novamente.'
}
export function isMetaOrigin(origin: string) {
  try {
    const url = new URL(origin)
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'facebook.com' ||
        url.hostname.endsWith('.facebook.com'))
    )
  } catch {
    return false
  }
}
