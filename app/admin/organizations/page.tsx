"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Eye, Trash2, RefreshCcw, Users, PlusCircle } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
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
import { useAdminStatus } from "@/hooks/use-auth-hooks"
import { useSession } from "@/hooks/use-auth-hooks"
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
  DialogTrigger,
} from "@/components/ui/dialog"

type Organization = {
  id: string
  name: string
  slug: string
  logo: string | null
  metadata: string | null
  createdAt: string
}

export default function OrganizationsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { isAdmin } = useAdminStatus()
  
  // DEVELOPMENT-ONLY: Override isAdmin check for testing purposes
  const isDevelopment = process.env.NODE_ENV === "development"
  const allowAccess = isDevelopment || isAdmin
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Organization creation state
  const [isCreating, setIsCreating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOrg, setNewOrg] = useState({
    name: "",
    slug: "",
    logo: ""
  })
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  async function fetchOrganizations() {
    setLoading(true)
    setError(null)
    setDebugInfo(null)
    
    // Debug session status
    console.log("Session status:", {
      session,
      isLoggedIn: !!session?.user,
      userRole: session?.user?.role,
      isAdmin,
      allowAccess,
      isDevelopment
    })
    
    try {
      // Directly fetch from API instead of using client method for debugging
      const response = await fetch('/admin/api/organizations')
      const responseData = await response.json()
      
      if (!response.ok) {
        console.error("API Error:", responseData)
        setDebugInfo(responseData)
        throw new Error(responseData.error || "Failed to fetch organizations")
      }
      
      console.log("API Response:", responseData)
      setOrganizations(responseData.organizations || [])
    } catch (err) {
      console.error("Error fetching organizations:", err)
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteOrganization() {
    if (!orgToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/admin/api/organizations?id=${orgToDelete}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete organization")
      }
      
      // Remove from list
      setOrganizations(orgs => orgs.filter(org => org.id !== orgToDelete))
      setOrgToDelete(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleCheckSlug() {
    if (!newOrg.slug.trim()) {
      setSlugAvailable(null)
      return
    }
    
    setCheckingSlug(true)
    try {
      const response = await fetch(`/admin/api/organizations/check-slug?slug=${encodeURIComponent(newOrg.slug)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Slug check error:", errorData)
        throw new Error(errorData.error || "Failed to check slug")
      }
      
      const data = await response.json()
      setSlugAvailable(data.available)
    } catch (err) {
      console.error("Error checking slug:", err)
      setSlugAvailable(null)
      toast({
        title: "Error",
        description: "Could not verify slug availability.",
        variant: "destructive"
      })
    } finally {
      setCheckingSlug(false)
    }
  }

  async function handleCreateOrganization() {
    if (!newOrg.name.trim() || !newOrg.slug.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and slug for the organization.",
        variant: "destructive"
      })
      return
    }
    
    if (slugAvailable === false) {
      toast({
        title: "Slug not available",
        description: "Please choose a different slug.",
        variant: "destructive"
      })
      return
    }
    
    setIsCreating(true)
    try {
      const response = await fetch('/admin/api/organizations', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newOrg.name,
          slug: newOrg.slug,
          logo: newOrg.logo || null,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error("API Error:", data)
        throw new Error(data.error || data.debug || "Failed to create organization")
      }
      
      // Add to list or refresh
      await fetchOrganizations()
      
      // Reset form
      setNewOrg({
        name: "",
        slug: "",
        logo: ""
      })
      setSlugAvailable(null)
      setCreateDialogOpen(false)
      
      toast({
        title: "Organization created",
        description: `Successfully created ${data.organization.name}.`
      })
    } catch (err) {
      console.error("Organization creation error:", err)
      const message = err instanceof Error ? err.message : "An error occurred"
      toast({
        title: "Creation failed",
        description: message,
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    // Only fetch if the user is an admin
    if (session?.user) {
      fetchOrganizations()
    }
  }, [session, isAdmin])

  // Display authentication status
  if (!session?.user) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">
          <h2 className="text-lg font-semibold">Not authenticated</h2>
          <p>Please sign in to access this page.</p>
          <Button asChild className="mt-4">
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Display admin check
  if (session?.user && !allowAccess) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p>Your account doesn't have admin privileges.</p>
          <p className="text-sm mt-2">User role: {session.user.role || "none"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <DialogDescription>
                  Create a new organization in the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input 
                    id="name" 
                    value={newOrg.name} 
                    onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug
                    {slugAvailable === true && (
                      <span className="ml-2 text-xs text-green-600">Available</span>
                    )}
                    {slugAvailable === false && (
                      <span className="ml-2 text-xs text-red-600">Not available</span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      id="slug" 
                      value={newOrg.slug} 
                      onChange={(e) => {
                        setNewOrg({...newOrg, slug: e.target.value})
                        setSlugAvailable(null)
                      }}
                      placeholder="acme"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleCheckSlug}
                      disabled={checkingSlug || !newOrg.slug.trim()}
                    >
                      {checkingSlug ? "Checking..." : "Check"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL (optional)</Label>
                  <Input 
                    id="logo" 
                    value={newOrg.logo} 
                    onChange={(e) => setNewOrg({...newOrg, logo: e.target.value})}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateOrganization} 
                  disabled={isCreating || !newOrg.name.trim() || !newOrg.slug.trim() || slugAvailable === false}
                >
                  {isCreating ? "Creating..." : "Create Organization"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={fetchOrganizations} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isDevelopment && !isAdmin && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          <p><strong>Development Mode:</strong> Admin check bypassed for testing purposes.</p>
        </div>
      )}

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md space-y-2">
          <p><strong>Error:</strong> {error}</p>
          {debugInfo && (
            <div className="text-xs mt-2 p-2 bg-black/10 rounded overflow-auto">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <CardDescription>
            View and manage all organizations in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading organizations...
            </div>
          ) : organizations.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              No organizations found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="flex items-center gap-2">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                      <span>{org.name}</span>
                    </TableCell>
                    <TableCell>{org.slug}</TableCell>
                    <TableCell>
                      {new Date(org.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/organizations/${org.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/organizations/${org.id}/members`}>
                            <Users className="h-4 w-4" />
                            <span className="sr-only">Members</span>
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setOrgToDelete(org.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the organization &quot;{organizations.find(o => o.id === orgToDelete)?.name}&quot;? 
                                This action cannot be undone and will remove all members, invitations, and data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setOrgToDelete(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteOrganization}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 