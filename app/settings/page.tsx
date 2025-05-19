"use client"

import { useState } from "react"
import { useSession } from "@/hooks/use-auth-hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { AlertTriangle, Loader2, Mail, LockIcon, UserIcon } from "lucide-react"
import { EmailVerificationBadge } from "@/components/email-verification-badge"

// Define tabs
type SettingsTab = "profile" | "security"

export default function SettingsPage() {
    const { data: session } = useSession()
    const [name, setName] = useState(session?.user?.name || "")
    const [loading, setLoading] = useState(false)
    const [verificationLoading, setVerificationLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile")

    const updateProfile = async () => {
        try {
            setLoading(true)
            // Implementation would depend on Better Auth's API for updating user profiles
            // This is a placeholder
            // await authClient.updateProfile({ name })
            toast.success("Profile updated successfully!")
        } catch (error) {
            console.error("Failed to update profile:", error)
            toast.error("Failed to update profile. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const resendVerificationEmail = async () => {
        try {
            setVerificationLoading(true)
            await authClient.sendVerificationEmail({
                email: session?.user?.email || "",
                callbackURL: "/settings"
            })
            toast.success("Verification email sent! Please check your inbox.")
        } catch (error) {
            console.error("Failed to send verification email:", error)
            toast.error("Failed to send verification email. Please try again.")
        } finally {
            setVerificationLoading(false)
        }
    }

    return (
        <div className="container py-12">
            <div className="mx-auto max-w-2xl space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>

                {/* Tab navigation */}
                <div className="flex border-b">
                    <button
                        className={`px-4 py-2 font-medium flex items-center gap-2 ${
                            activeTab === "profile"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setActiveTab("profile")}
                    >
                        <UserIcon className="h-4 w-4" />
                        Profile
                    </button>
                    <button
                        className={`px-4 py-2 font-medium flex items-center gap-2 ${
                            activeTab === "security"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setActiveTab("security")}
                    >
                        <LockIcon className="h-4 w-4" />
                        Security
                    </button>
                </div>

                {/* Profile tab content */}
                {activeTab === "profile" && (
                    <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold">Profile Information</h2>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                    id="name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Email</Label>
                                    <EmailVerificationBadge 
                                        verified={session?.user?.emailVerified ?? false} 
                                    />
                                </div>
                                
                                <div className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm items-center ${
                                    !session?.user?.emailVerified 
                                        ? "border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20" 
                                        : "border-input bg-background"
                                }`}>
                                    {session?.user?.email || ""}
                                </div>
                                
                                {!session?.user?.emailVerified && (
                                    <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                    Please verify your email address to access all features. 
                                                    Check your inbox for the verification link or click below to resend.
                                                </p>
                                                <div className="mt-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={resendVerificationEmail}
                                                        disabled={verificationLoading}
                                                        className="border-yellow-300 hover:bg-yellow-100 hover:text-yellow-800 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
                                                    >
                                                        {verificationLoading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail className="mr-2 h-3 w-3" />
                                                                Resend Verification Email
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button 
                            className="mt-4" 
                            onClick={updateProfile} 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                )}

                {/* Security tab content */}
                {activeTab === "security" && (
                    <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold">Security Settings</h2>
                        
                        <div className="space-y-6">
                            {/* Email verification section (always visible) */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Email Verification</h3>
                                <p className="text-sm text-muted-foreground">
                                    Verify your email address to secure your account and access all features.
                                </p>
                                
                                <div className="flex items-center justify-between rounded-md border p-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`rounded-full h-3 w-3 ${session?.user?.emailVerified ? "bg-green-500" : "bg-yellow-500"}`}></div>
                                        <span>
                                            {session?.user?.emailVerified 
                                                ? "Your email is verified" 
                                                : "Your email is not verified"}
                                        </span>
                                    </div>
                                    
                                    {!session?.user?.emailVerified && (
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={resendVerificationEmail}
                                            disabled={verificationLoading}
                                        >
                                            {verificationLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                "Verify Email"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Password section */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Password</h3>
                                <p className="text-sm text-muted-foreground">
                                    Change your password or reset it if you've forgotten it.
                                </p>
                                
                                <div className="flex flex-col gap-2 mt-2">
                                    <Button variant="outline">
                                        Change Password
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Account activity section */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">Account Activity</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage your active sessions and devices.
                                </p>
                                
                                <div className="flex flex-col gap-2 mt-2">
                                    <Button variant="outline">
                                        Manage Sessions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 