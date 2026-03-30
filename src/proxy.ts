import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export default async function proxy(request: NextRequest) {
  // Build ID: vercel-fix-v4-92cf8a7-retry
  const response = await updateSession(request)
  
  // If user is logged in, and tries to access login/register, redirect to home
  // Supabase cookie names vary by project, so we check for any cookie containing '-auth-token'
  const hasSession = request.cookies.getAll().some(c => c.name.includes('auth-token'))
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
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
