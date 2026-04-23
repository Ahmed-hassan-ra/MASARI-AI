import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Public routes — accessible without login
  const publicRoutes = ["/", "/about", "/contact", "/privacy", "/terms", "/auth/login", "/auth/register", "/auth/error", "/api/auth", "/api/register", "/api/contact"]

  // Auth routes — redirect to dashboard if already logged in
  const authRoutes = ["/auth/login", "/auth/register"]

  const path = request.nextUrl.pathname

  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith(route + "/"))
  const isAuthRoute = authRoutes.some((route) => path === route)

  // Redirect authenticated users away from login/register to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users to login for everything else
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
