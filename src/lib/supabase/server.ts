import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikgzyoltuiiwkrnjznml.supabase.co'
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_dz9m42mg4w9PB-B2N356Ag_79XOeuXR'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components não podem gravar cookies; proxy.ts renova a sessão.
          }
        },
      },
    },
  )
}
