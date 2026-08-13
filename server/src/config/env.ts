// Carrega e valida as variáveis de ambiente exigidas pelo servidor.
// Nunca importar segredos de outro lugar — tudo passa por aqui.
import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`)
  }
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),

  // Origens permitidas pra CORS (frontend). Lista separada por vírgula.
  // Em produção NUNCA deixar em branco — sem isso, cors() ficaria aberto
  // pra qualquer origem, o que expõe a API (autenticada, mas ainda assim)
  // a qualquer site fazer requisições de browser contra ela.
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // DataCrazy — usado exclusivamente por server/services/datacrazy (Fase 2)
  datacrazy: {
    apiToken: process.env.DATACRAZY_API_TOKEN ?? '',
    baseUrl: process.env.DATACRAZY_API_BASE_URL ?? 'https://api.g1.datacrazy.io/api/v1',
    webhookSecret: process.env.DATACRAZY_WEBHOOK_SECRET ?? '',
  },

  // Firebase Admin — usado por lib/firebaseAdmin.ts
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  },
}

// Validação estrita fica para quando o servidor realmente sobe (Fase 4),
// não no import — isso evita quebrar `tsc --noEmit` sem um .env presente.
export function assertRequiredEnv() {
  required('DATACRAZY_API_TOKEN')
  required('FIREBASE_PROJECT_ID')
  required('FIREBASE_CLIENT_EMAIL')
  required('FIREBASE_PRIVATE_KEY')
}
