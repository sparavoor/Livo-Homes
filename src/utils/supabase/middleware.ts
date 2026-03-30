import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      auth: {
        storageKey: 'sb-livo-auth-token',
      }
    }
  )

  // Optimization: Skip auth network request for public pages if no auth cookie is present
  const pathname = request.nextUrl.pathname;
  const isPublicRoute = !pathname.startsWith('/admin') && !pathname.startsWith('/profile') && !pathname.startsWith('/checkout');
  const authCookie = request.cookies.get('sb-livo-auth-token');
  
  if (isPublicRoute && !authCookie) {
    return { supabaseResponse, user: null };
  }

  // Refresh auth token only if we potentially have a session or are on a protected route
  const { data: { user } } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
