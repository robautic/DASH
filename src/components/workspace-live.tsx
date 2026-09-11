'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function WorkspaceLive({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  useEffect(() => {
    const supabase = createClient()
    let pending: ReturnType<typeof setTimeout> | undefined
    function refresh() {
      if (pending || document.visibilityState !== 'visible') return
      pending = setTimeout(() => { pending = undefined; router.refresh() }, 750)
    }
    const channel = supabase.channel(`workspace-live:${tenantId}`)
    for (const table of ['conversations', 'messages', 'pipeline_items']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `tenant_id=eq.${tenantId}` }, refresh)
    }
    channel.subscribe()
    const interval = setInterval(refresh, 30000)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('online', refresh)
    return () => {
      clearTimeout(pending); clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('online', refresh)
      void supabase.removeChannel(channel)
    }
  }, [router, tenantId])
  return null
}
