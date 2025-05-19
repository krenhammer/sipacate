"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-auth-hooks"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, LogOut, Settings } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

export function UnverifiedUserButton() {
    const { data: session } = useSession()
    const router = useRouter()

    if (!session?.user) return null

    const userName = session.user.name || session.user.email
    const userImage = session.user.image
    const userInitials = userName?.charAt(0).toUpperCase() || "?"

    const handleSignOut = async () => {
        try {
            await authClient.signOut()
            toast.success("Signed out successfully")
            // Force navigation and page refresh
            window.location.href = '/auth/sign-in'; 
        } catch (error) {
            console.error("Sign out failed:", error)
            toast.error("Failed to sign out. Please try again.")
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-8 rounded-full border-2 border-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    aria-label="Account requires verification. Click for options."
                >
                    <Avatar className="size-full">
                        {userImage && <AvatarImage src={userImage} alt={userName || "User"} />}
                        <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                    <AlertTriangle className="absolute bottom-[-2px] right-[-2px] h-3 w-3 fill-yellow-600 text-yellow-700 dark:fill-yellow-400 dark:text-yellow-500 rounded-full bg-background p-0.5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end" forceMount>
                <div className="p-2">
                    <p className="text-sm font-medium text-foreground">
                        {userName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {session.user.email}
                    </p>
                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                       <AlertTriangle className="h-3 w-3" /> Verification Required
                    </p>
                </div>
                <div className="border-t border-border p-1">
                     <Link href="/settings">
                        <Button
                            variant="ghost"
                            className="w-full justify-start px-2 py-1.5 text-sm font-normal"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start px-2 py-1.5 text-sm font-normal"
                        onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
} 