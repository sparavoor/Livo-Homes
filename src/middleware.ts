import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export default async function middleware(request: NextRequest) {
  // Update session handles refreshing the auth token and keeping it current
  // It returns a response that has already handled auth state
  const response = await updateSession(request)
  
  // We should check the actual session state if possible
  // For now, let's refine the cookie check to be more specific to Supabase
  // but better yet, let's use the result of updateSession if we can pass data back,
  // or just check the URL and cookies carefully.
  
  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  
  // Check for the Supabase auth token specifically (sb-<project-id>-auth-token)
  // Since we don't have project ID here easily, we check for a cookie that has 'auth-token'
  // but ONLY if the path is an auth page.
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.includes('auth-token'))

  if (hasAuthCookie && isAuthPage) {
    // If we have a cookie and we are on an auth page, allow the page to load
    // so the client-side AuthContext can verify if it's a valid session.
    // ONLY redirect if we are SURE it's a valid persistent session.
    // For now, let the AuthContext handle redirection to avoid loops.
    // return NextResponse.redirect(new URL('/', request.url))
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
