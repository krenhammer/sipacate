"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { useSession } from "@/hooks/use-auth-hooks"
import { cn } from "@/lib/utils"

export function AuthView({ pathname }: { pathname: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const addSession = searchParams.get("addSession") === "true"

    useEffect(() => {
        router.refresh()
    }, [router])

    // Redirect to dashboard if user is authenticated, UNLESS adding a new session
    useEffect(() => {
        if (session && pathname !== "sign-out" && !addSession) {
            router.push("/dashboard")
        }
    }, [session, router, pathname, addSession])

    return (
        <main className="flex grow flex-col items-center justify-center gap-3 p-4">
             
            <AuthCard pathname={pathname}/>

            <p
                className={cn(
                    ["callback", "settings", "sign-out"].includes(pathname) && "hidden",
                    "text-muted-foreground text-xs"
                )}
            >
                {/* Powered by{" "}
                <Link
                    className="text-warning underline"
                    href="https://better-auth.com"
                    target="_blank"
                >
                    better-auth.
                </Link> */}
            </p>
        </main>
    )
}
