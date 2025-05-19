"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-auth-hooks"
import { Loader2 } from "lucide-react"

// Define allowed paths OUTSIDE the component for clarity
const allowedPaths = ["/settings", "/verify-email", "/auth/sign-in", "/auth/register", "/auth/get-started"]

export function EmailVerificationGuard({
    children
}: {
    children: React.ReactNode
}) {
    const { data: sessionData, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    console.log("[Guard] Path:", pathname, "Status:", status);

    // Effect to handle redirection if necessary
    useEffect(() => {
        console.log("[Guard Effect] Path:", pathname, "Status:", status, "Session Data:", sessionData);
        if (status === "success") {
            const user = sessionData?.user
            const isAnonymous = !!user?.isAnonymous
            const isVerified = !!user?.emailVerified
            const isAllowed = allowedPaths.includes(pathname)
            const shouldRedirect = user && !isVerified && !isAnonymous && !isAllowed;
            
            console.log("[Guard Effect] User:", user?.email, "Verified:", isVerified, "Anonymous:", isAnonymous, "Path Allowed:", isAllowed, "Should Redirect:", shouldRedirect);

            if (shouldRedirect) {
                console.log("[Guard Effect] REDIRECTING to /settings");
                router.push("/settings")
            }
        }
    }, [status, sessionData, pathname, router])

    // Render Logic:
    // 1. Show loader ONLY when session is initially loading
    if (status === "pending") {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // 2. In all other cases (success, error), render children.
    // The useEffect above handles redirection for unverified users on restricted pages.
    // This prevents unmounting children (like Header/UserButton) during sign-out.
    return <>{children}</>
} 