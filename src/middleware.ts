import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export default async function middleware(request: NextRequest) {
  // Update session handles refreshing the auth token and keeping it current
  const response = await updateSession(request)
  
  // Basic session heuristic to avoid flashes
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('auth-token'))
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  
  // If we have a session cookie and we are on an auth page, send to home
  // But we only do this if it's a DIRECT access (not an internal redirect) to avoid loops
  if (hasAuthCookie && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
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
