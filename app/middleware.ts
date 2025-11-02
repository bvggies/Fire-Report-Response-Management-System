import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminPanel = req.nextUrl.pathname.startsWith('/dashboard/admin')

    // Protect super admin panel
    if (isAdminPanel && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public pages
        if (!req.nextUrl.pathname.startsWith('/dashboard')) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
