"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Users, LogOut, PlusCircle } from "lucide-react"
// import type { Session } from "better-auth/client"
import { useSession } from "@/hooks/use-auth-hooks" // Assuming this provides current session info

export function SessionSwitcher() {
    const [sessions, setSessions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { data: currentSessionInfo } = useSession() // Get current session token if available

    const fetchSessions = async () => {
        setIsLoading(true)
        const { data, error } = await authClient.multiSession.listDeviceSessions()
       
        console.log("Multi-Session Sessions fetched:", data)

        if (data) {
            setSessions(data)
        } else {
            console.error("Error fetching sessions:", error)
            // Handle error appropriately, maybe show a toast
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const findSession = (sessionId: string) => {
        return sessions.find(({session}) => session.id === sessionId)
    }

    const handleSetActive = async (sessionId: string) => {
        const session = findSession(sessionId)

        console.log("Attempting to set active session:", sessionId, session); // Log entry
        const { error } = await authClient.multiSession.setActive({ 
            sessionToken: session?.session?.token,
        })
        if (error) {
            console.error("Error setting active session:", error)
            // Handle error
        } else {
            console.log("Successfully set active session, reloading..."); // Log success
            // Reload or update UI to reflect the new active session
             window.location.reload(); // Simple reload for now
        }
    }

    const handleRevoke = async (sessionId: string) => {
        const session = findSession(sessionId)
        const { error } = await authClient.multiSession.revoke({ 
            sessionToken: session?.session?.token
        })
         if (error) {
             console.error("Error revoking session:", error)
             // Handle error
         } else {
             // Refetch sessions after revoking
             fetchSessions()
         }
    }

    // Find the current active session from the list using the correct property 'token'
    const activeSession = currentSessionInfo?.session;

    console.log("Active Session:", activeSession, sessions)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                    <Users className="h-4 w-4" />
                    <span className="sr-only">Switch Session</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Accounts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoading ? (
                    <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : (
                    sessions.map(({session, user}) => {
                        console.log("Session:", session)
                        return (
                            <DropdownMenuItem key={session.id} className="flex justify-between items-center">
                                <span>
                                    {user.email}
                                    {session.id === activeSession?.id && " (Active)"}
                                </span>
                                <div>
                                    {session.id !== activeSession?.id && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => {
                                                console.log("Switch button clicked for session:", session.id); // Log click with correct token
                                                handleSetActive(session.id) // Pass correct token
                                            }} 
                                            className="mr-1">
                                            Switch
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => handleRevoke(session.token)} title="Sign out this session">
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            </DropdownMenuItem>
                        )
                    })
                )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                     <Link href="/auth/sign-in?addSession=true" className="flex items-center">
                         <PlusCircle className="mr-2 h-4 w-4" /> Add Account
                     </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 