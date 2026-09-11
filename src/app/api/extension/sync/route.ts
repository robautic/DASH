import { createClient } from '@/lib/supabase/server'
import { validateCapture } from '@/lib/extension-sync'

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  if (request.headers.get('origin') !== origin || request.headers.get('x-fluxolu-extension') !== '1') {
    return Response.json({ error: 'origin_not_allowed' }, { status: 403 })
  }
  const text = await request.text()
  if (text.length > 600000) return Response.json({ error: 'batch_too_large' }, { status: 413 })
  let body
  try {
    body = JSON.parse(text)
    body.messages = validateCapture(body.messages)
    if (!/^[0-9a-f-]{36}$/i.test(body.tenantId) || !/^[0-9a-f-]{36}$/i.test(body.userId)) throw new Error()
  } catch {
    return Response.json({ error: 'invalid_batch' }, { status: 400 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== body.userId) return Response.json({ error: 'session_changed' }, { status: 401 })
  const { data, error } = await supabase.rpc('ingest_extension_messages', {
    p_tenant_id: body.tenantId, p_messages: body.messages,
  })
  if (error) return Response.json({ error: error.code === '42501' ? 'workspace_forbidden' : 'sync_failed' }, { status: error.code === '42501' ? 403 : 500 })
  return Response.json({ ok: true, inserted: data }, { headers: { 'Cache-Control': 'no-store' } })
}
