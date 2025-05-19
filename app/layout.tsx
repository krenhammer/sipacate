import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "@/styles/globals.css"

import { Header } from "@/components/header"
import type { ReactNode } from "react"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import { EmailVerificationGuard } from "./email-verification-guard"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: "sipacate",
    description: "Sipacate. Marketing for the AI Generation."
}

export const viewport: Viewport = {
    initialScale: 1,
    viewportFit: "cover",
    width: "device-width",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
        { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" }
    ]
}

export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <div className="flex min-h-svh flex-col">
                        <Header />

                        {/* Wrap children with the guard */}
                        <EmailVerificationGuard>
                            {children}
                        </EmailVerificationGuard>
                    </div>
                    <Toaster />
                </Providers>
            </body>
        </html>
    )
}
