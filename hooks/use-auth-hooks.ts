import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { createAuthUIHooks } from "@daveyplate/better-auth-ui"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

export const {
    useListAccounts,
    useListDeviceSessions,
    useListPasskeys,
    useListSessions,
    usePrefetchSession,
    useSession,
    useToken
} = createAuthHooks(authClient)

export const { useAuthenticate } = createAuthUIHooks(authClient)

/**
 * Custom hook to check admin status and impersonation state
 * @returns Object containing isAdmin and isImpersonating states
 */
export const useAdminStatus = () => {
    const { data: session } = useSession()
    const [isImpersonating, setIsImpersonating] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    
    useEffect(() => {
        const checkImpersonation = async () => {
            try {
                // Check if current session is impersonated
                const sessionData = await authClient.getSession()
                const impersonatedBy = sessionData.data?.session?.impersonatedBy
                if (impersonatedBy) {
                    setIsImpersonating(true)
                } else {
                    setIsImpersonating(false)
                }
            } catch (error) {
                console.error("Error checking impersonation status", error)
                setIsImpersonating(false)
            }
        }
        
        const checkAdminStatus = async () => {
            try {
                const response = session?.user?.role === "admin"
                setIsAdmin(response)
            } catch (error) {
                console.error("Error checking admin permissions", error)
                setIsAdmin(false)
            }
        }
        
        if (session?.user) {
            checkImpersonation()
            checkAdminStatus()
        }
    }, [session])
    
    const stopImpersonation = async () => {
        if (isImpersonating) {
            try {
                await authClient.admin.stopImpersonating();
                window.location.href = '/admin'
                return true
            } catch (error) {
                console.error("Error stopping impersonation", error)
                return false
            }
        }
        return false
    }
    
    return { isAdmin, isImpersonating, stopImpersonation }
}
