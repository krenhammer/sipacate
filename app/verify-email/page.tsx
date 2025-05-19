"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/hooks/use-auth-hooks"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function VerifyEmailPage() {
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)

    const resendVerificationEmail = async () => {
        try {
            setLoading(true)
            await authClient.sendVerificationEmail({
                email: session?.user?.email || "",
                callbackURL: "/dashboard"
            })
            toast.success("Verification email sent! Please check your inbox.")
        } catch (error) {
            console.error("Failed to send verification email:", error)
            toast.error("Failed to send verification email. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container flex flex-col items-center justify-center py-12">
            <div className="mx-auto max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h1 className="text-2xl font-bold">Verify Your Email</h1>
                    <p className="text-muted-foreground">
                        To access all features, please verify your email address. We've sent a verification link to: 
                    </p>
                    <p className="font-medium">{session?.user?.email}</p>
                </div>

                <div className="space-y-4">
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Check your inbox and spam folder for the verification email. Click the link in the email to verify your account.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button 
                        className="w-full" 
                        onClick={resendVerificationEmail}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Resend Verification Email"
                        )}
                    </Button>

                    <div className="flex justify-between">
                        <Button variant="ghost" asChild>
                            <Link href="/settings">
                                Settings
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/auth/sign-out">
                                Sign Out
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 