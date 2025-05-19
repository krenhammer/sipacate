import { useState, useEffect } from "react"
import { useSession } from "@/hooks/use-auth-hooks"
import { toast } from "sonner"

export type Invitation = {
  id: string
  email: string
  organizationId: string
  organizationName?: string
  role: string
  status: string
  expiresAt: string
  createdAt: string
  updatedAt: string | null
  inviterName: string | null
  inviterEmail: string | null
}

export function useInvitations() {
  const { data: session } = useSession()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvitations = async () => {
    if (!session?.user) {
      setInvitations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/invitations')
      if (!response.ok) {
        throw new Error('Failed to fetch invitations')
      }
      const data = await response.json()
      console.log("Invitations data from API:", JSON.stringify(data.invitations, null, 2))
      
      // Map over invitations to ensure they all have an organizationName
      const processedInvitations = data.invitations.map((invitation: Invitation) => {
        if (!invitation.organizationName && invitation.organizationId) {
          console.log(`Missing organization name for invitation ${invitation.id}, will use fallback`)
          return {
            ...invitation,
            organizationName: "Organization"
          };
        }
        return invitation;
      });
      
      setInvitations(processedInvitations || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching invitations:', err)
      setError('Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (invitationId: string, organizationId: string) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          organizationId,
          action: 'accept'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to accept invitation')
      }

      toast.success('Invitation accepted successfully')
      await fetchInvitations() // Refresh the list
      return true
    } catch (err) {
      console.error('Error accepting invitation:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation')
      return false
    }
  }

  const rejectInvitation = async (invitationId: string, organizationId: string) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          organizationId,
          action: 'reject'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject invitation')
      }

      toast.success('Invitation rejected')
      await fetchInvitations() // Refresh the list
      return true
    } catch (err) {
      console.error('Error rejecting invitation:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to reject invitation')
      return false
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchInvitations()
    }
  }, [session])

  return { 
    invitations, 
    loading, 
    error, 
    fetchInvitations, 
    acceptInvitation, 
    rejectInvitation,
    hasInvitations: invitations.length > 0
  }
} 