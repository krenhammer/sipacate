import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export const runtime = "edge"

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    
    // Skip middleware for specific routes that should be accessible to unverified users
    if (
        pathname.startsWith("/api/") || 
        pathname.startsWith("/_next/") || 
        pathname.startsWith("/auth/") ||
        pathname === "/favicon.ico" ||
        pathname.includes("manifest") ||
        pathname === "/verify-email" ||
        pathname === "/" ||
        pathname.startsWith("/settings") ||
        pathname === "/logout" ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".jpeg") ||
        pathname.endsWith(".ico") ||
        pathname.endsWith(".json")
    ) {
        return NextResponse.next()
    }

    // Get the user session
    const session = await auth.api.getSession(request)
    
    // If no session, redirect to login for protected routes
    if (!session?.user && 
        (pathname.startsWith("/dashboard") || 
         pathname.startsWith("/admin") || 
         pathname.startsWith("/settings"))) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }
    
    // For admin routes in production mode, verify admin role
    const isDevelopment = process.env.NODE_ENV === "development"
    const isAdminRoute = pathname.startsWith("/admin")
    
    if (isAdminRoute && !isDevelopment && session?.user?.role !== "admin") {
        // In production, only allow admin access to users with admin role
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    
    // Check if email is verified
    if (session?.user && !session.user.emailVerified && !session.user.isAnonymous) {
        // Allow access only to settings, verify-email, and logout pages
        if (!pathname.startsWith("/settings") && 
            pathname !== "/logout" && 
            pathname !== "/verify-email") {
            // Block access to dashboard, pricing, and admin routes for unverified users
            return NextResponse.redirect(new URL("/verify-email", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * 1. /api/auth/* (auth API routes)
         * 2. /_next/* (Next.js internals)
         * 3. Static files with extensions
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)'
    ]
}