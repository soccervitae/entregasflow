import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isPdvRoute = url.pathname.startsWith('/pdv')
  const isEntregadorRoute = url.pathname.startsWith('/entregador/corridas') || url.pathname.startsWith('/entregador/historico')

  if (!user && (isPdvRoute || isEntregadorRoute)) {
    if (isPdvRoute) {
      url.pathname = '/login'
    } else {
      url.pathname = '/entregador'
    }
    return NextResponse.redirect(url)
  }

  if (user && url.pathname === '/') {
    url.pathname = '/pdv'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
