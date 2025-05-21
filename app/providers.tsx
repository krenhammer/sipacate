"use client"

// import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"
// import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack"
// import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { Toaster, toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { ConvexClientProvider } from "./ConvexClientProvider"
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";

// function makeQueryClient() {
//     return new QueryClient({
//         defaultOptions: {
//             queries: {
//                 // With SSR, we usually want to set some default staleTime
//                 // above 0 to avoid refetching immediately on the client
//                 staleTime: 60 * 1000
//             }
//         }
//     })
// }

// let browserQueryClient: QueryClient | undefined = undefined

// function getQueryClient() {
//     if (isServer) {
//         // Server: always make a new query client
//         return makeQueryClient()
//     }

//     // Browser: make a new query client if we don't already have one
//     // This is very important, so we don't re-make a new client if React
//     // suspends during the initial render. This may not be needed if we
//     // have a suspense boundary BELOW the creation of the query client
//     if (!browserQueryClient) browserQueryClient = makeQueryClient()
//     return browserQueryClient
// }

export function Providers({ children }: { children: ReactNode }) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    // const queryClient = getQueryClient()
    // queryClient.getQueryCache().config.onError = (error, query) => {
    //     // Avoid logging too many redirect errors which are expected during auth flow
    //     if (error && error.message !== "0") {
    //         console.error(error, query)

    //         if (error.message && error.message !== "0") {
    //             toast.error(error.message)
    //         }
    //     }
    // }

    const router = useRouter()

    const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    return (
        // <QueryClientProvider client={queryClient}>
        //     <AuthQueryProvider>

        <ConvexClientProvider>
            <ConvexAuthNextjsProvider client={convex}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                    themeColor={{
                        light: "oklch(1 0 0)",
                        dark: "oklch(0.145 0 0)"
                    }}
                >
                    {/* <AuthUIProviderTanstack
                    providers={[
                        "google",
                        // "github", 
                        // "apple"
                    ]}
                    authClient={authClient}
                    navigate={router.push}
                    replace={router.replace}
                    onSessionChange={() => {
                        console.log("Session changed")
                        router.refresh()

                        // try {
                        //     // Only refresh if we're not in the auth flow
                        //     if (!window.location.pathname.startsWith('/auth/')) {
                        //         router.refresh()

                        //         // If we have a session and we're on the home page, go to dashboard
                        //         if (session && window.location.pathname === '/') {
                        //             router.push('/dashboard')
                        //         }
                        //     }
                        // } catch (error) {
                        //     console.error("Session change error:", error)
                        // }
                    }}
                    Link={Link}
                > */}
                    {children}

                    <Toaster />
                    {/* </AuthUIProviderTanstack> */}
                </ThemeProvider>
            </ConvexAuthNextjsProvider>
        </ConvexClientProvider>
        //     </AuthQueryProvider>
        // </QueryClientProvider>
    )
}
