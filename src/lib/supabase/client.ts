import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikgzyoltuiiwkrnjznml.supabase.co'
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_dz9m42mg4w9PB-B2N356Ag_79XOeuXR'

export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey)
}
