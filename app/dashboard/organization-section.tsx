import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useSession, useAdminStatus } from "@/hooks/use-auth-hooks"
import { useInvitations } from "@/hooks/use-invitations-hook"
import { Building, Check, Clock, Loader2, Users, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

// Types for Organization Memberships
type Organization = {
  id: string
  name: string
  slug: string
  logo: string | null
}

type Team = {
  id: string
  name: string
  organizationId: string
}

type Membership = {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt: string
  updatedAt: string
}

type MembershipWithDetails = {
  membership: Membership
  organization: Organization
  teams: Team[]
}

type InvitationStatus = "pending" | "accepted" | "rejected" | "all"

export function OrganizationSection() {
  const { data: session } = useSession()
  const { isAdmin } = useAdminStatus()
  const [activeInvitationTab, setActiveInvitationTab] = useState<InvitationStatus>("pending")
  const [memberships, setMemberships] = useState<MembershipWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { invitations, loading: invitationsLoading, acceptInvitation, rejectInvitation } = useInvitations()
  const [pendingInvitations, setPendingInvitations] = useState<Record<string, boolean>>({})
  
  // Default to "organizations" tab unless there are no organizations but there are invitations
  const [activeMainTab, setActiveMainTab] = useState("organizations")

  useEffect(() => {
    const fetchMemberships = async () => {
      if (!session?.user) {
        setMemberships([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/organizations/memberships')
        if (!response.ok) {
          throw new Error('Failed to fetch organization memberships')
        }
        const data = await response.json()
        setMemberships(data.memberships || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching memberships:', err)
        setError('Failed to load organization memberships')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchMemberships()
    }
  }, [session])

  useEffect(() => {
    // After data is loaded, set the default active tab
    if (!loading && !invitationsLoading) {
      // Filter out invalid memberships
      const validMemberships = memberships.filter(
        item => item.organization && item.organization.name !== "Unknown Organization"
      )
      
      // If there are no organizations but there are invitations, default to invitations tab
      if (validMemberships.length === 0 && invitations.length > 0) {
        setActiveMainTab("invitations")
      }
    }
  }, [loading, invitationsLoading, memberships, invitations])
  
  // If admin, don't show this combined component
  if (isAdmin) {
    return null
  }

  const handleAccept = async (invitationId: string, organizationId: string) => {
    setPendingInvitations((prev) => ({ ...prev, [invitationId]: true }))
    await acceptInvitation(invitationId, organizationId)
    setPendingInvitations((prev) => ({ ...prev, [invitationId]: false }))
    // Refresh memberships after accepting an invitation
    const response = await fetch('/api/organizations/memberships')
    if (response.ok) {
      const data = await response.json()
      setMemberships(data.memberships || [])
    }
  }

  const handleReject = async (invitationId: string, organizationId: string) => {
    setPendingInvitations((prev) => ({ ...prev, [invitationId]: true }))
    await rejectInvitation(invitationId, organizationId)
    setPendingInvitations((prev) => ({ ...prev, [invitationId]: false }))
  }

  // Count invitations by status
  const pendingCount = invitations.filter(inv => inv.status === "pending").length
  const acceptedCount = invitations.filter(inv => inv.status === "accepted").length
  const rejectedCount = invitations.filter(inv => inv.status === "rejected").length

  // Filter invitations based on active tab
  const filteredInvitations = invitations.filter(invitation => {
    if (activeInvitationTab === "all") return true
    return invitation.status === activeInvitationTab
  })

  // Debug log - remove after fixing
  console.log("Filtered invitations:", filteredInvitations)

  // Filter out invalid memberships
  const validMemberships = memberships.filter(
    item => item.organization && item.organization.name !== "Unknown Organization"
  )

  // If both are loading or there's nothing to show, don't render anything
  if ((loading && invitationsLoading) || (validMemberships.length === 0 && invitations.length === 0)) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Organizations
        </CardTitle>
        <CardDescription>
          Manage your organization memberships and invitations
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 pt-0">
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="organizations" className="relative">
              Organizations
              {validMemberships.length > 0 && (
                <Badge className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">{validMemberships.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invitations" className="relative">
              Invitations
              {pendingCount > 0 && (
                <Badge className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">{pendingCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Organizations Tab Content */}
          <TabsContent value="organizations" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : validMemberships.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                You are not a member of any organizations.
              </div>
            ) : (
              <ul className="space-y-4">
                {validMemberships.map((item) => (
                  <li 
                    key={item.membership.id} 
                    className="rounded-md border p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-medium">{item.organization.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                            {item.membership.role}
                          </span>
                          <span className="ml-2">
                            Joined {new Date(item.membership.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/organization/${item.organization.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                    
                    {item.teams && item.teams.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                          <Users className="h-4 w-4" />
                          Teams
                        </h4>
                        <ul className="space-y-1">
                          {item.teams.map(team => (
                            <li key={team.id} className="text-sm pl-5 py-1 border-l-2 border-muted">
                              {team.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          
          {/* Invitations Tab Content */}
          <TabsContent value="invitations" className="mt-0">
            {invitationsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                You have no organization invitations.
              </div>
            ) : (
              <>
                <Tabs value={activeInvitationTab} onValueChange={(value) => setActiveInvitationTab(value as InvitationStatus)} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="pending" className="relative">
                      Pending
                      {pendingCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">{pendingCount}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="accepted" className="relative">
                      Accepted
                      {acceptedCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">{acceptedCount}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="relative">
                      Rejected
                      {rejectedCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">{rejectedCount}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeInvitationTab} className="mt-0">
                    {filteredInvitations.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No {activeInvitationTab !== "all" ? activeInvitationTab : ""} invitations found.
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {filteredInvitations.map((invitation) => {
                          console.log(`Invitation ${invitation.id} organization name:`, invitation.organizationName);
                          return (
                          <li 
                            key={invitation.id} 
                            className="flex items-center justify-between rounded-md border p-4"
                          >
                            <div>
                              <div className="font-medium">{invitation.inviterName || invitation.inviterEmail}</div>
                              <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-extrabold">{invitation.organizationName }</span> has invited you to join with the role: <span className="font-italic">{invitation.role}</span>
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {invitation.status === "accepted" ? (
                                  <>Accepted on {new Date(invitation.updatedAt || invitation.createdAt).toLocaleDateString()}</>
                                ) : invitation.status === "rejected" ? (
                                  <>Rejected on {new Date(invitation.updatedAt || invitation.createdAt).toLocaleDateString()}</>
                                ) : (
                                  <>Expires {new Date(invitation.expiresAt).toLocaleDateString()}</>
                                )}
                              </div>
                            </div>
                            {invitation.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(invitation.id, invitation.organizationId)}
                                  disabled={pendingInvitations[invitation.id]}
                                >
                                  {pendingInvitations[invitation.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4 mr-1" />
                                  )}
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAccept(invitation.id, invitation.organizationId)}
                                  disabled={pendingInvitations[invitation.id]}
                                >
                                  {pendingInvitations[invitation.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-1" />
                                  )}
                                  Accept
                                </Button>
                              </div>
                            )}
                          </li>
                          );
                        })}
                      </ul>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 