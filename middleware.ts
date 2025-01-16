import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 認証が不要なパスの配列
  const publicPaths = ['/login', '/signup', '/forgot-password']
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname)

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}