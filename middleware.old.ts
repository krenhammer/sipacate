import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Skip middleware for API routes and static files
    if (
        pathname.startsWith("/api/") || 
        pathname.startsWith("/_next/") || 
        pathname.startsWith("/auth/") ||
        pathname === "/favicon.ico" ||
        pathname.includes("manifest") ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".jpeg") ||
        pathname.endsWith(".ico") ||
        pathname.endsWith(".json")
    ) {
        return NextResponse.next()
    }

    try {
        // Check if user is authenticated
        const session = await auth.getSession({ req: request })

        // Public routes
        if (pathname === "/") {
            if (session) {
                // If user is logged in, redirect from home to dashboard
                return NextResponse.redirect(new URL("/dashboard", request.url))
            }
            return NextResponse.next()
        }

        // Protected routes
        if (
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/profile")
        ) {
            if (!session) {
                // If user is not logged in, redirect to login page
                return NextResponse.redirect(new URL("/auth/sign-in", request.url))
            }
            return NextResponse.next()
        }

        return NextResponse.next()
    } catch (error) {
        console.error("Middleware error:", error)
        return NextResponse.next()
    }
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
