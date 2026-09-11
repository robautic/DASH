import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikgzyoltuiiwkrnjznml.supabase.co'
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_dz9m42mg4w9PB-B2N356Ag_79XOeuXR'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname
  const isPublic = path === '/' || path === '/fluxolu-extension.zip' || ['/login', '/cadastro', '/recuperar-senha'].some((route) => path.startsWith(route)) || path.startsWith('/auth/')

  if (isPublic) return response

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (path.startsWith('/api/')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }
  } catch {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  return response
}
