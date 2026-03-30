import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export default async function middleware(request: NextRequest) {
  // Update session handles refreshing the auth token and keeping it current
  const { supabaseResponse, user } = await updateSession(request)
  
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  
  // If we have a user and we are on an auth page, send to profile immediately
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/profile'
    const redirectResponse = NextResponse.redirect(url)
    // Copy cookies from supabaseResponse to the redirectResponse
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // If visiting profile without user, redirect to login
  if (!user && pathname.startsWith('/profile')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', '/profile')
    const redirectResponse = NextResponse.redirect(url)
    // Copy cookies from supabaseResponse to ensure session state is updated
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
