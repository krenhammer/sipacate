"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  ArrowLeft, 
  RefreshCcw, 
  User, 
  Calendar, 
  Users, 
  Inbox, 
  Pencil, 
  UserPlus, 
  Briefcase, 
  PlusCircle, 
  Trash2 
} from "lucide-react"

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
  TabsTrigger 
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Organization = {
  id: string
  name: string
  slug: string
  logo: string | null
  metadata: string | null
  createdAt: string
}

type Member = {
  memberId: string
  userId: string
  name: string | null
  email: string
  image: string | null
  role: string
  joinedAt: string
}

type Invitation = {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  expiresAt: string
  inviterName: string | null
  inviterEmail: string
}

type Team = {
  id: string
  name: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export default function OrganizationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit organization state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [editLogo, setEditLogo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // For new invitation
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    role: "member"
  })
  const [isInviting, setIsInviting] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // For new team
  const [newTeam, setNewTeam] = useState({
    name: ""
  })
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  
  // For editing team
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editTeamName, setEditTeamName] = useState("")
  const [isEditingTeam, setIsEditingTeam] = useState(false)
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false)

  async function fetchOrganization() {
    setLoading(true)
    setError(null)
    try {
      // Fetch organization details
      const response = await fetch(`/admin/api/organizations?id=${params.id}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch organization")
      }
      const data = await response.json()
      const org = data.organizations?.[0]
      if (!org) {
        throw new Error("Organization not found")
      }
      
      setOrganization(org)
      setEditName(org.name)
      setEditSlug(org.slug)
      setEditLogo(org.logo || "")
      
      // Fetch members
      await fetchMembers()
      
      // Fetch invitations
      await fetchInvitations()
      
      // Fetch teams
      await fetchTeams()
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
    } finally {
      setLoading(false)
    }
  }
  
  async function fetchMembers() {
    try {
      const response = await fetch(`/admin/api/organizations/members?organizationId=${params.id}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch members")
      }
      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      console.error("Error fetching members:", err)
    }
  }
  
  async function fetchInvitations() {
    try {
      const response = await fetch(`/admin/api/organizations/invitations?organizationId=${params.id}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch invitations")
      }
      const data = await response.json()
      setInvitations(data.invitations || [])
    } catch (err) {
      console.error("Error fetching invitations:", err)
    }
  }

  async function fetchTeams() {
    try {
      const response = await fetch(`/admin/api/organizations/${params.id}/teams`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch teams")
      }
      const data = await response.json()
      setTeams(data.teams || [])
    } catch (err) {
      console.error("Error fetching teams:", err)
    }
  }

  async function handleUpdateOrganization() {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/admin/api/organizations/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          logo: editLogo || null,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update organization")
      }
      
      const data = await response.json()
      setOrganization({
        ...organization!,
        name: editName,
        slug: editSlug,
        logo: editLogo || null,
      })
      
      setIsEditing(false)
      toast({
        title: "Organization updated",
        description: "Organization details have been updated successfully."
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  async function handleInviteMember() {
    setIsInviting(true)
    try {
      const response = await fetch(`/admin/api/organizations/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId: params.id,
          email: newInvitation.email,
          role: newInvitation.role,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send invitation")
      }
      
      // Refresh invitations
      await fetchInvitations()
      
      setNewInvitation({
        email: "",
        role: "member"
      })
      
      setInviteDialogOpen(false)
      toast({
        title: "Invitation sent",
        description: `Invitation has been sent to ${newInvitation.email}.`
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Failed to send invitation",
        description: message,
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }
  
  async function handleCancelInvitation(invitationId: string) {
    try {
      const response = await fetch(`/admin/api/organizations/invitations?invitationId=${invitationId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel invitation")
      }
      
      // Remove from list
      setInvitations(invites => invites.filter(invite => invite.id !== invitationId))
      
      toast({
        title: "Invitation canceled",
        description: "The invitation has been canceled successfully."
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Cancel failed",
        description: message,
        variant: "destructive"
      })
    }
  }
  
  async function handleRemoveMember(memberId: string) {
    try {
      const response = await fetch(`/admin/api/organizations/members?memberId=${memberId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to remove member")
      }
      
      // Remove from list
      setMembers(mems => mems.filter(mem => mem.memberId !== memberId))
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the organization."
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Remove failed",
        description: message,
        variant: "destructive"
      })
    }
  }

  async function handleCreateTeam() {
    setIsCreatingTeam(true)
    try {
      const response = await fetch(`/admin/api/organizations/${params.id}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTeam.name,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create team")
      }
      
      // Refresh teams
      await fetchTeams()
      
      // Reset form
      setNewTeam({
        name: ""
      })
      setTeamDialogOpen(false)
      
      toast({
        title: "Team created",
        description: "Team has been created successfully."
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Creation failed",
        description: message,
        variant: "destructive"
      })
    } finally {
      setIsCreatingTeam(false)
    }
  }

  async function handleEditTeam() {
    if (!editingTeam) return
    
    setIsEditingTeam(true)
    try {
      const response = await fetch(`/admin/api/organizations/${params.id}/teams/${editingTeam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editTeamName,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update team")
      }
      
      // Refresh teams
      await fetchTeams()
      
      // Reset form
      setEditingTeam(null)
      setEditTeamName("")
      setEditTeamDialogOpen(false)
      
      toast({
        title: "Team updated",
        description: "Team has been updated successfully."
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive"
      })
    } finally {
      setIsEditingTeam(false)
    }
  }

  async function handleDeleteTeam(teamId: string) {
    try {
      const response = await fetch(`/admin/api/organizations/${params.id}/teams/${teamId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete team")
      }
      
      // Refresh teams
      await fetchTeams()
      
      toast({
        title: "Team deleted",
        description: "Team has been deleted successfully."
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Deletion failed",
        description: message,
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchOrganization()
  }, [params.id])
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/organizations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Organization Details</h1>
        </div>
        
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
        
        <Button asChild>
          <Link href="/admin/organizations">Back to Organizations</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/organizations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Organization Details</h1>
        </div>
        <Button onClick={fetchOrganization} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[350px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                {organization?.logo ? (
                  <img
                    src={organization.logo}
                    alt={organization.name}
                    className="h-8 w-8 rounded-md"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
                {organization?.name}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2" 
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Organization slug: <span className="font-medium">{organization?.slug}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{organization ? new Date(organization.createdAt).toLocaleDateString() : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Members:</span>
                <span>{members.length}</span>
              </div>
              {organization?.metadata && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-1">Metadata</h3>
                  <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                    {JSON.stringify(JSON.parse(organization.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invitations">Invitations</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                  <CardDescription>
                    Organization details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      placeholder="https://example.com/logo.png"
                      value={editLogo}
                      onChange={(e) => setEditLogo(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    People who are part of this organization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      No members in this organization.
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {members.map((member) => (
                        <li 
                          key={member.memberId} 
                          className="flex items-center justify-between p-3 border rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name || member.email}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{member.name || member.email}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              className="text-xs border rounded px-2 py-1"
                              value={member.role}
                              onChange={async (e) => {
                                const newRole = e.target.value;
                                try {
                                  const response = await fetch('/admin/api/organizations/members', {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                      memberId: member.memberId,
                                      role: newRole,
                                      organizationId: params.id
                                    })
                                  });
                                  
                                  if (!response.ok) {
                                    throw new Error('Failed to update member role');
                                  }
                                  
                                  // Update in the UI
                                  setMembers(members => members.map(m => 
                                    m.memberId === member.memberId 
                                      ? {...m, role: newRole} 
                                      : m
                                  ));
                                  
                                  toast({
                                    title: "Role Updated",
                                    description: `${member.name || member.email}'s role updated to ${newRole}.`
                                  });
                                } catch (err) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to update member role.",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {member.name || member.email} from this organization?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(`/admin/api/organizations/members?id=${member.memberId}&organizationId=${params.id}`, {
                                          method: 'DELETE'
                                        });
                                        
                                        if (!response.ok) {
                                          throw new Error('Failed to remove member');
                                        }
                                        
                                        // Remove from list
                                        setMembers(members => members.filter(m => m.memberId !== member.memberId));
                                        
                                        toast({
                                          title: "Member Removed",
                                          description: `${member.name || member.email} has been removed from the organization.`
                                        });
                                      } catch (err) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to remove member.",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-end">
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          Invite New Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite member to organization</DialogTitle>
                          <DialogDescription>
                            Send an invitation to join this organization.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="user@example.com"
                              value={newInvitation.email}
                              onChange={(e) => setNewInvitation({
                                ...newInvitation,
                                email: e.target.value
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <select
                              id="role"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={newInvitation.role}
                              onChange={(e) => setNewInvitation({
                                ...newInvitation,
                                role: e.target.value
                              })}
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="owner">Owner</option>
                            </select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setInviteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleInviteMember}
                            disabled={!newInvitation.email || isInviting}
                          >
                            {isInviting ? "Sending..." : "Send Invitation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invitations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invitations</CardTitle>
                  <CardDescription>
                    Manage invitations to join this organization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pending" className="w-full mb-6">
                    <TabsList className="grid grid-cols-4 mb-4">
                      <TabsTrigger value="pending">
                        Pending
                      </TabsTrigger>
                      <TabsTrigger value="accepted">
                        Accepted
                      </TabsTrigger>
                      <TabsTrigger value="rejected">
                        Rejected
                      </TabsTrigger>
                      <TabsTrigger value="all">
                        All
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending">
                      {invitations.filter(inv => inv.status === "pending").length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground">
                          No pending invitations.
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {invitations.filter(inv => inv.status === "pending").map((invitation) => (
                            <li 
                              key={invitation.id} 
                              className="flex items-center justify-between p-3 border rounded-md"
                            >
                              <div>
                                <p className="font-medium">{invitation.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Invited by {invitation.inviterName || invitation.inviterEmail}
                                  {" • "}
                                  {new Date(invitation.createdAt).toLocaleDateString()}
                                  {" • "}
                                  Expires: {new Date(invitation.expiresAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                  {invitation.status}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {invitation.role}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="accepted">
                      {invitations.filter(inv => inv.status === "accepted").length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground">
                          No accepted invitations.
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {invitations.filter(inv => inv.status === "accepted").map((invitation) => (
                            <li 
                              key={invitation.id} 
                              className="flex items-center justify-between p-3 border rounded-md"
                            >
                              <div>
                                <p className="font-medium">{invitation.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Invited by {invitation.inviterName || invitation.inviterEmail}
                                  {" • "}
                                  {new Date(invitation.createdAt).toLocaleDateString()}
                                  {" • "}
                                  Accepted: {new Date(invitation.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  {invitation.status}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {invitation.role}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="rejected">
                      {invitations.filter(inv => inv.status === "rejected").length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground">
                          No rejected invitations.
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {invitations.filter(inv => inv.status === "rejected").map((invitation) => (
                            <li 
                              key={invitation.id} 
                              className="flex items-center justify-between p-3 border rounded-md"
                            >
                              <div>
                                <p className="font-medium">{invitation.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Invited by {invitation.inviterName || invitation.inviterEmail}
                                  {" • "}
                                  {new Date(invitation.createdAt).toLocaleDateString()}
                                  {" • "}
                                  Rejected: {new Date(invitation.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                  {invitation.status}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {invitation.role}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="all">
                      {invitations.length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground">
                          No invitations found.
                        </div>
                      ) : (
                        <ul className="space-y-4">
                          {invitations.map((invitation) => (
                            <li 
                              key={invitation.id} 
                              className="flex items-center justify-between p-3 border rounded-md"
                            >
                              <div>
                                <p className="font-medium">{invitation.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Invited by {invitation.inviterName || invitation.inviterEmail}
                                  {" • "}
                                  {new Date(invitation.createdAt).toLocaleDateString()}
                                  {" • "}
                                  {invitation.status === "pending" ? 
                                    `Expires: ${new Date(invitation.expiresAt).toLocaleString()}` : 
                                    `${invitation.status === "accepted" ? "Accepted" : "Rejected"}: ${new Date(invitation.createdAt).toLocaleString()}`
                                  }
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  invitation.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                                    : invitation.status === 'accepted'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {invitation.status}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {invitation.role}
                                </span>
                                {invitation.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => handleCancelInvitation(invitation.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="teams" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Teams</h3>
                <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>
                        Create a new team in this organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-name">Team Name</Label>
                        <Input 
                          id="team-name" 
                          value={newTeam.name} 
                          onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                          placeholder="Development Team"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateTeam} 
                        disabled={isCreatingTeam || !newTeam.name.trim()}
                      >
                        {isCreatingTeam ? "Creating..." : "Create Team"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No teams found for this organization.
                </div>
              ) : (
                <div className="space-y-2">
                  {teams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(team.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingTeam(team)
                              setEditTeamName(team.name)
                              setEditTeamDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/organizations/${params.id}/teams/${team.id}`}>
                              View
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the team "{team.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteTeam(team.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Edit Organization Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Organization</DialogTitle>
                <DialogDescription>
                  Update the organization's details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    placeholder="https://example.com/logo.png"
                    value={editLogo}
                    onChange={(e) => setEditLogo(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateOrganization}
                  disabled={!editName || !editSlug || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Team edit dialog */}
          <Dialog open={editTeamDialogOpen} onOpenChange={setEditTeamDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team</DialogTitle>
                <DialogDescription>
                  Update team information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-team-name">Team Name</Label>
                  <Input 
                    id="edit-team-name" 
                    value={editTeamName} 
                    onChange={(e) => setEditTeamName(e.target.value)}
                    placeholder="Team Name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setEditingTeam(null)
                  setEditTeamDialogOpen(false)
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditTeam} 
                  disabled={isEditingTeam || !editTeamName.trim()}
                >
                  {isEditingTeam ? "Updating..." : "Update Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
} 