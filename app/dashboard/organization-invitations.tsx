import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useInvitations } from "@/hooks/use-invitations-hook"
import { Building, Check, Clock, Loader2, X } from "lucide-react"
import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type InvitationStatus = "pending" | "accepted" | "rejected" | "all"

export function OrganizationInvitations() {
  const { invitations, loading, acceptInvitation, rejectInvitation } = useInvitations()
  const [pendingInvitations, setPendingInvitations] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<InvitationStatus>("pending")

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Organization Invitations
          </CardTitle>
          <CardDescription>
            Invitations to join organizations
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6 pt-2">
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return null
  }

  const handleAccept = async (invitationId: string, organizationId: string) => {
    setPendingInvitations((prev) => ({ ...prev, [invitationId]: true }))
    await acceptInvitation(invitationId, organizationId)
    setPendingInvitations((prev) => ({ ...prev, [invitationId]: false }))
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
    if (activeTab === "all") return true
    return invitation.status === activeTab
  })

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Organization Invitations
        </CardTitle>
        <CardDescription>
          Invitations to join organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 pt-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InvitationStatus)} className="w-full">
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
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredInvitations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No {activeTab !== "all" ? activeTab : ""} invitations found.
              </div>
            ) : (
              <ul className="space-y-4">
                {filteredInvitations.map((invitation) => (
                  <li 
                    key={invitation.id} 
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div>
                      <div className="font-medium">{invitation.inviterName || invitation.inviterEmail}</div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">{invitation.organizationName || "Organization"}</span> has invited you to join with the role: <span className="font-medium">{invitation.role}</span>
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
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 