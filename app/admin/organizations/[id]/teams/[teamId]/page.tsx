"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  RefreshCcw, 
  User, 
  Users, 
  Briefcase, 
  Pencil,
  PlusCircle,
  Trash2,
  Search,
  CheckCircle2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

type Team = {
  id: string
  name: string
  organizationId: string
  createdAt: string
  updatedAt: string
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

export default function TeamPage({ params }: { params: { id: string, teamId: string } }) {
  const router = useRouter()
  const { id: organizationId, teamId } = params
  
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [organizationMembers, setOrganizationMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // For editing team
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // For adding members
  const [addMembersOpen, setAddMembersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isAddingMembers, setIsAddingMembers] = useState(false)

  async function fetchTeam() {
    setLoading(true)
    setError(null)
    try {
      // Fetch team details
      const response = await fetch(`/admin/api/organizations/${organizationId}/teams/${teamId}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch team")
      }
      const data = await response.json()
      
      setTeam(data.team)
      setEditName(data.team.name)
      
      // Fetch team members
      await fetchTeamMembers()
      
      // Fetch all organization members for the "add member" feature
      await fetchOrganizationMembers()
      
    } catch (err) {
      console.error("Error fetching team:", err)
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
    } finally {
      setLoading(false)
    }
  }
  
  async function fetchTeamMembers() {
    try {
      const response = await fetch(`/admin/api/organizations/${organizationId}/teams/${teamId}/members`)
      if (!response.ok) {
        throw new Error("Failed to fetch team members")
      }
      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      console.error("Error fetching team members:", err)
    }
  }
  
  async function fetchOrganizationMembers() {
    try {
      const response = await fetch(`/admin/api/organizations/members?organizationId=${organizationId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch organization members")
      }
      const data = await response.json()
      setOrganizationMembers(data.members || [])
    } catch (err) {
      console.error("Error fetching organization members:", err)
    }
  }

  async function handleUpdateTeam() {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/admin/api/organizations/${organizationId}/teams/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update team")
      }
      
      setTeam({
        ...team!,
        name: editName,
      })
      
      setIsEditing(false)
      toast({
        title: "Team updated",
        description: "Team details have been updated successfully."
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
  
  async function handleAddMembers() {
    if (selectedMembers.length === 0) return
    
    setIsAddingMembers(true)
    try {
      const response = await fetch(`/admin/api/organizations/${organizationId}/teams/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberIds: selectedMembers,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add members")
      }
      
      // Refresh team members
      await fetchTeamMembers()
      
      // Clear selection
      setSelectedMembers([])
      setAddMembersOpen(false)
      
      toast({
        title: "Members added",
        description: `${selectedMembers.length} member(s) added to the team.`
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Failed to add members",
        description: message,
        variant: "destructive"
      })
    } finally {
      setIsAddingMembers(false)
    }
  }
  
  async function handleRemoveMember(memberId: string) {
    try {
      const response = await fetch(`/admin/api/organizations/${organizationId}/teams/${teamId}/members?memberId=${memberId}`, {
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
        description: "The member has been removed from the team."
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

  useEffect(() => {
    fetchTeam()
  }, [organizationId, teamId])
  
  // Filter organization members for adding to team
  const eligibleMembers = organizationMembers.filter(orgMember => 
    // Not already in team
    !members.some(teamMember => teamMember.memberId === orgMember.memberId) &&
    // Matches search query
    (searchQuery === "" || 
      orgMember.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orgMember.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/organizations/${organizationId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Team Details</h1>
        </div>
        
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
        
        <Button asChild>
          <Link href={`/admin/organizations/${organizationId}`}>Back to Organization</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/organizations/${organizationId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Team Details</h1>
        </div>
        <Button onClick={fetchTeam} variant="outline" size="sm">
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
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
                {team?.name}
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
                Team ID: <span className="font-mono text-xs">{team?.id}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Members:</span>
                <span>{members.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{team ? new Date(team.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <Button size="sm" onClick={() => setAddMembersOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            </div>

            {members.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-medium">No Members</h3>
                <p className="text-muted-foreground mb-4">
                  This team doesn't have any members yet.
                </p>
                <Button onClick={() => setAddMembersOpen(true)}>
                  Add Team Members
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <Card key={member.memberId}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name || member.email}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{member.name || member.email}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'owner' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                            : member.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {member.role}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name || member.email} from this team?
                                This will only remove them from the team, not from the organization.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveMember(member.memberId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
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
          </div>
          
          {/* Edit Team Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team</DialogTitle>
                <DialogDescription>
                  Update the team's details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
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
                  onClick={handleUpdateTeam}
                  disabled={!editName || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Add Members Dialog */}
          <Dialog open={addMembersOpen} onOpenChange={setAddMembersOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Team Members</DialogTitle>
                <DialogDescription>
                  Add organization members to this team.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search members..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Separator />
                
                <div className="text-sm text-muted-foreground">
                  {eligibleMembers.length} members available to add
                </div>
                
                <ScrollArea className="h-72">
                  <div className="space-y-4">
                    {eligibleMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {organizationMembers.length === 0 
                          ? "No members in the organization."
                          : searchQuery 
                            ? "No members found matching your search."
                            : "All members are already in this team."}
                      </div>
                    ) : (
                      eligibleMembers.map((member) => (
                        <div 
                          key={member.memberId} 
                          className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
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
                              <p className="font-medium text-sm">{member.name || member.email}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                              {member.role}
                            </span>
                            <Checkbox 
                              id={member.memberId}
                              checked={selectedMembers.includes(member.memberId)}
                              onCheckedChange={(checked: boolean | "indeterminate") => {
                                if (checked === true) {
                                  setSelectedMembers(prev => [...prev, member.memberId])
                                } else {
                                  setSelectedMembers(prev => 
                                    prev.filter(id => id !== member.memberId)
                                  )
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
                {selectedMembers.length > 0 && (
                  <div className="bg-muted p-2 rounded-md flex justify-between items-center text-sm">
                    <span>{selectedMembers.length} member(s) selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMembers([])}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAddMembersOpen(false)
                    setSelectedMembers([])
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddMembers}
                  disabled={selectedMembers.length === 0 || isAddingMembers}
                >
                  {isAddingMembers ? (
                    "Adding..."
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Add to Team
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
} 