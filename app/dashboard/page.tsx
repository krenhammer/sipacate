"use client"

import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import { SubscriptionStatus } from "./subscription-status"
import { useSession, useAdminStatus } from "@/hooks/use-auth-hooks"
import { Button } from "@/components/ui/button"
import { UserX, Shield } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { OrganizationInvitations } from "./organization-invitations"
import { OrganizationMemberships } from "./organization-memberships"
import { OrganizationSection } from "./organization-section"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
    const { data: session } = useSession()
    const { isAdmin, isImpersonating } = useAdminStatus()
    const isManager = session?.user?.role === "manager" || session?.user?.role === "mgr" || isAdmin
    
    const stopImpersonating = async () => {
        try {
            await authClient.admin.stopImpersonating()
            toast.success("Stopped impersonating user")
            window.location.href = "/admin" // Redirect back to admin
        } catch (error) {
            console.error("Failed to stop impersonating", error)
            toast.error("Failed to stop impersonating")
        }
    }
    
    return (
        <div className="container px-4 md:px-6 py-12">
            {isImpersonating && (
                <div className="mb-6 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 p-4 text-yellow-800 dark:text-yellow-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserX className="h-5 w-5" />
                            <p>You are currently impersonating this user.</p>
                        </div>
                        <Button 
                            onClick={stopImpersonating}
                            variant="outline"
                            className="border-yellow-400 hover:bg-yellow-200 dark:border-yellow-700 dark:hover:bg-yellow-800"
                        >
                            Stop Impersonating
                        </Button>
                    </div>
                </div>
            )}
            
            <h1 className="mb-6 text-3xl font-bold">Welcome, {session?.user?.name || "User"}!</h1>
            
            {isAdmin && !isImpersonating && (
                <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Admin Access</h3>
                        </div>
                        <Button asChild>
                            <Link href="/admin">
                                Admin Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
            
            {/* For admins, show the components separately. For non-admins, show the combined view */}
            {isAdmin ? (
                <>
                    <OrganizationInvitations />
                    <OrganizationMemberships />
                </>
            ) : (
                <OrganizationSection />
            )}
            
            <SubscriptionStatus />
            
            {/* API Key Management - Link to dedicated page for admins and managers */}
            {isManager && (
                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Keys</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">Manage API keys for programmatic access to the application.</p>
                            <Button asChild>
                                <Link href="/api-keys">
                                    Manage API Keys
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
} 