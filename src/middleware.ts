import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'
import { hasSupabaseClientConfig } from '@/lib/supabase/env'
import { isApiPath, isPublicPath } from '@/lib/auth/public-paths'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (!hasSupabaseClientConfig()) {
    const message =
      'Configuration Error: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your environment.'
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: message }, { status: 500 })
    }
    return new NextResponse(message, { status: 500 })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createMiddlewareClient(request, () => response)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!user && pathname !== '/login') {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js)$).*)',
  ],
}
