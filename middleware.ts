// import { auth, runtime } from "./auth"
import { NextRequest, NextResponse } from "next/server"
import authConfig from "./lib/auth.config";
import NextAuth from "next-auth"
// List of routes that require authentication
const protectedRoutes = ["/dashboard", "/calendar", "/categories", "/exercises", "/history", "/profile", "/settings", "/timer", "/timer-strategies", "/weights"];
const authRoutes = ["/auth/signin", "/auth/register"];


const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req: NextRequest) {
  // Your custom middleware logic goes here
})

// export default auth(async (req) => {
//   // Temporarily disable middleware to test main app functionality
//   return NextResponse.next()
  
//   /*
//   const path = req.nextUrl.pathname
  
//   // If the user is authenticated and trying to access login pages, redirect to dashboard
//   if (req.auth && authRoutes.some(route => path.startsWith(route))) {
//     console.log('[Middleware] User already authenticated, redirecting to dashboard')
//     return NextResponse.redirect(new URL('/dashboard', req.url))
//   }
  
//   // If user is not authenticated and trying to access protected routes, redirect to sign in
//   if (!req.auth && protectedRoutes.some(route => path.startsWith(route))) {
//     console.log('[Middleware] User not authenticated, redirecting to sign in')
//     const signInUrl = new URL('/auth/signin', req.url)
//     signInUrl.searchParams.set('callbackUrl', path)
//     return NextResponse.redirect(signInUrl)
//   }
  
//   return NextResponse.next()
//   */
// })

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
  runtime: 'nodejs'
}