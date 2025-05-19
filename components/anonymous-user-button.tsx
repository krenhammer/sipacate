"use client"

import Link from "next/link"
import { useSession } from "@/hooks/use-auth-hooks"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings } from "lucide-react" // Use User icon for generic anonymous
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

export function AnonymousUserButton() {
    const { data: session } = useSession()

    if (!session?.user || !session.user.isAnonymous) return null

    // Use user-provided name if available, otherwise default
    const userName = session.user.name || "Anonymous User"
    const userImage = session.user.image
    // Use first letter of name, or a generic user icon if no name
    const userInitials = userName !== "Anonymous User" ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />

    const handleSignOut = async () => {
        try {
            await authClient.signOut()
            toast.success("Signed out successfully")
            // Redirect to home or sign-in page after anonymous sign out
            window.location.href = '/';
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
                    className="relative size-8 rounded-full"
                    aria-label="Anonymous user account. Click for options."
                >
                    <Avatar className="size-full">
                        {userImage && <AvatarImage src={userImage} alt={userName} />}
                        <AvatarFallback className="text-xs">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    {/* Optional: Add a subtle indicator for anonymous status if desired */}
                    {/* <User className="absolute bottom-[-2px] right-[-2px] h-3 w-3 text-muted-foreground rounded-full bg-background p-0.5" /> */}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end" forceMount>
                <div className="p-2">
                    <p className="text-sm font-medium text-foreground">
                        {userName}
                    </p>
                     {/* Don't show the temporary email */}
                    {/* <p className="text-xs text-muted-foreground">
                        {session.user.email}
                    </p> */}
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                       <User className="h-3 w-3" /> Anonymous Account
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