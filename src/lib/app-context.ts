import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AppBootstrap } from '@/lib/domain'

export async function getAppContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase.rpc('get_app_bootstrap', { p_tenant_id: null })
  if (error) throw new Error(`Falha ao carregar workspace: ${error.message}`)

  const bootstrap = (data || {}) as AppBootstrap
  const active = bootstrap.active_workspace
  const tenantId = active?.tenant_id || active?.id
  if (!tenantId) redirect('/onboarding')

  return { supabase, user, bootstrap, tenantId }
}
