"use client"

import { useState, useEffect, useMemo } from "react"
import { authClient } from "@/lib/auth-client"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ColumnDef, 
  createColumnHelper, 
} from "@tanstack/react-table"
import { 
  UserPlus, 
  MoreVertical, 
  Shield, 
  Ban, 
  Trash, 
  RefreshCw, 
  Key,
  MailCheck,
  CreditCard
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"

// Define the User type
type User = {
  id: string
  name: string
  email: string
  role: string
  banned: boolean
  banReason?: string
  banExpires?: Date
  createdAt: Date
  emailVerified: boolean
}

// Create a form schema for new user
const createUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().min(1, { message: "Role is required" }),
})

// Create a column helper for the user table
const columnHelper = createColumnHelper<User>()

// Define subscription type
type SubscriptionActivity = {
  id: string;
  plan: string;
  status: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  referenceId: string;
  cancelAtPeriodEnd?: boolean;
  seats?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isSetRoleOpen, setIsSetRoleOpen] = useState(false)
  const [isBanUserOpen, setIsBanUserOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState("")
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("")
  const [subscriptions, setSubscriptions] = useState<SubscriptionActivity[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("updatedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Create form for new user
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersResponseResult = await authClient.admin.listUsers({
        query: {
          limit: 50, // increased limit to get more users at once
        }
      })

      const response = usersResponseResult.data;
      
      if (response && 'users' in response && Array.isArray(response.users)) {
        setUsers(response.users as User[])
        setTotal(response.total || 0)
      } else {
        console.error("Invalid response structure:", response)
        toast.error("Failed to load users: Invalid response")
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }
  
  // Create a new user
  const createUser = async (data: z.infer<typeof createUserSchema>) => {
    try {
      const response = await authClient.admin.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      
      if (response) {
        toast.success("User created successfully")
        createUserForm.reset()
        setIsCreateUserOpen(false)
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to create user:", error)
      toast.error("Failed to create user")
    }
  }
  
  // Set user role
  const setUserRole = async () => {
    if (!selectedUser || !newRole) return
    
    try {
      await authClient.admin.setRole({
        userId: selectedUser.id,
        role: newRole,
      })
      
      toast.success(`Role updated to ${newRole}`)
      setIsSetRoleOpen(false)
      setNewRole("")
      fetchUsers()
    } catch (error) {
      console.error("Failed to update role:", error)
      toast.error("Failed to update role")
    }
  }
  
  // Ban a user
  const banUser = async () => {
    if (!selectedUser) return
    
    try {
      const banExpiresIn = banDuration ? parseInt(banDuration) * 60 * 60 * 24 : undefined // Convert days to seconds
      
      await authClient.admin.banUser({
        userId: selectedUser.id,
        banReason: banReason || undefined,
        banExpiresIn,
      })
      
      toast.success("User banned successfully")
      setIsBanUserOpen(false)
      setBanReason("")
      setBanDuration("")
      fetchUsers()
    } catch (error) {
      console.error("Failed to ban user:", error)
      toast.error("Failed to ban user")
    }
  }
  
  // Unban a user
  const unbanUser = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({
        userId,
      })
      
      toast.success("User unbanned successfully")
      fetchUsers()
    } catch (error) {
      console.error("Failed to unban user:", error)
      toast.error("Failed to unban user")
    }
  }
  
  // Delete a user
  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }
    
    try {
      await authClient.admin.removeUser({
        userId,
      })
      
      toast.success("User deleted successfully")
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    }
  }
  
  // Impersonate a user
  const impersonateUser = async (userId: string) => {
    try {
      await authClient.admin.impersonateUser({
        userId,
      })
      
      toast.success("Now impersonating user")
      window.location.href = "/dashboard" // Redirect to dashboard as the impersonated user
    } catch (error) {
      console.error("Failed to impersonate user:", error)
      toast.error("Failed to impersonate user")
    }
  }
  
  // Function to fetch subscriptions for a user
  const fetchSubscriptions = async (userId: string) => {
    try {
      setSubscriptionsLoading(true)
   
      // Fetch subscriptions from the admin API
      const response = await fetch(`/admin/api/subscriptions?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        setSubscriptions(data)
      } else {
        setSubscriptions([])
        if (!response.ok) {
          toast.error(data.error || "Failed to load subscription data")
        }
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error)
      toast.error("Failed to load subscription data")
      setSubscriptions([])
    } finally {
      setSubscriptionsLoading(false)
    }
  }
  
  // Toggle email verification status
  const toggleEmailVerification = async (userId: string, currentStatus: boolean) => {
    try {
      // Call the email verification API endpoint
      const response = await fetch('/admin/api/email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verificationStatus: !currentStatus
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success(`Email ${!currentStatus ? "verified" : "unverified"} successfully`)
        fetchUsers()
      } else {
        toast.error(data.error || "Failed to update email verification status")
      }
    } catch (error) {
      console.error("Failed to update email verification status:", error)
      toast.error("Failed to update email verification status")
    }
  }
  
  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = [...subscriptions]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        sub => sub.plan.toLowerCase().includes(query) || 
               sub.status.toLowerCase().includes(query) || 
               sub.id.toLowerCase().includes(query) ||
               (sub.stripeSubscriptionId && sub.stripeSubscriptionId.toLowerCase().includes(query))
      )
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortField as keyof SubscriptionActivity]
      const bValue = b[sortField as keyof SubscriptionActivity]
      
      if (!aValue && !bValue) return 0
      if (!aValue) return 1
      if (!bValue) return -1
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime()
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
  }, [subscriptions, searchQuery, sortField, sortDirection, statusFilter])
  
  // Send password reset email
  const sendPasswordResetEmail = async () => {
    if (!selectedUser) return
    
    try {
      await authClient.forgetPassword({
        email: selectedUser.email,
        redirectTo: "/auth/reset-password",
      })
      
      toast.success("Password reset email sent successfully")
      setIsPasswordResetOpen(false)
    } catch (error) {
      console.error("Failed to send password reset email:", error)
      toast.error("Failed to send password reset email")
    }
  }
  
  // Define columns for the user table
  const columns: ColumnDef<User, any>[] = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => (
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("banned", {
      header: "Status",
      cell: (info) => {
        const banned = info.getValue()
        return (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${banned ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}`}>
            {banned ? "Banned" : "Active"}
          </span>
        )
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor("emailVerified", {
      header: "Email Status",
      cell: (info) => {
        const verified = info.getValue()
        return (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${verified ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
            {verified ? "Verified" : "Unverified"}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const user = info.row.original
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user)
                setNewRole(user.role)
                setIsSetRoleOpen(true)
              }}>
                <Shield className="mr-2 h-4 w-4" /> Set Role
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => toggleEmailVerification(user.id, user.emailVerified)}>
                <MailCheck className="mr-2 h-4 w-4" /> {user.emailVerified ? "Mark as Unverified" : "Verify Email"}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => {
                setSelectedUser(user)
                setIsPasswordResetOpen(true)
              }}>
                <RefreshCw className="mr-2 h-4 w-4" /> Password Email
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedUser(user)
                  fetchSubscriptions(user.id)
                  setIsSubscriptionModalOpen(true)
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" /> Subscription Activity
              </DropdownMenuItem>
              
              {user.banned ? (
                <DropdownMenuItem onClick={() => unbanUser(user.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => {
                  setSelectedUser(user)
                  setIsBanUserOpen(true)
                }}>
                  <Ban className="mr-2 h-4 w-4" /> Ban User
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => impersonateUser(user.id)}>
                <Key className="mr-2 h-4 w-4" /> Impersonate
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => deleteUser(user.id)}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ]
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to your application.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...createUserForm}>
                <form onSubmit={createUserForm.handleSubmit(createUser)} className="space-y-4">
                  <FormField
                    control={createUserForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createUserForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createUserForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createUserForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            {...field}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Create User</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="rounded-md border">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : (
          <DataTable columns={columns} data={users} searchKey="email" searchPlaceholder="Search by email..." />
        )}
      </div>
      
      {/* Set Role Dialog */}
      <Dialog open={isSetRoleOpen} onOpenChange={setIsSetRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Select Role
              </label>
              <select 
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" onClick={setUserRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ban User Dialog */}
      <Dialog open={isBanUserOpen} onOpenChange={setIsBanUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.name} from accessing the application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="banReason" className="text-sm font-medium">
                Ban Reason (optional)
              </label>
              <Input
                id="banReason"
                placeholder="Reason for ban"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="banDuration" className="text-sm font-medium">
                Ban Duration (days, leave empty for permanent)
              </label>
              <Input
                id="banDuration"
                type="number"
                min="1"
                placeholder="Number of days"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="destructive"
              onClick={banUser}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Password Reset Email</DialogTitle>
            <DialogDescription>
              Send a password reset email to {selectedUser?.name} ({selectedUser?.email}).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This will send an email with a link to reset the password.
              The user will be able to set a new password by clicking on the link.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              onClick={sendPasswordResetEmail}
            >
              Send Reset Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Subscription Activity Modal */}
      <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Activity for {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              View and manage subscription history and activity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="flex gap-2">
                <Input
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="canceled">Canceled</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="incomplete_expired">Incomplete Expired</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div className="flex gap-2">
                <select 
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="updatedAt">Updated Date</option>
                  <option value="createdAt">Created Date</option>
                  <option value="periodEnd">Period End</option>
                  <option value="periodStart">Period Start</option>
                  <option value="plan">Plan</option>
                  <option value="status">Status</option>
                </select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  >
                    <path d="m3 16 4 4 4-4"/>
                    <path d="M7 20V4"/>
                    <path d="m21 8-4-4-4 4"/>
                    <path d="M17 4v16"/>
                  </svg>
                </Button>
              </div>
            </div>
            
            {subscriptionsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
                </div>
              </div>
            ) : filteredSubscriptions.length ? (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Plan</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Period</th>
                      <th className="px-4 py-3 text-left font-medium">Trial</th>
                      <th className="px-4 py-3 text-left font-medium">Subscription ID</th>
                      <th className="px-4 py-3 text-left font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b">
                        <td className="px-4 py-3">
                          <span className="font-medium">{subscription.plan}</span>
                          {subscription.seats && subscription.seats > 1 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({subscription.seats} seats)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            subscription.status === "active" ? "bg-green-500/10 text-green-500" : 
                            subscription.status === "trialing" ? "bg-blue-500/10 text-blue-500" : 
                            subscription.status === "canceled" ? "bg-orange-500/10 text-orange-500" : 
                            "bg-red-500/10 text-red-500"
                          }`}>
                            {subscription.status}
                            {subscription.cancelAtPeriodEnd && " (canceling)"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {subscription.periodStart && subscription.periodEnd ? (
                            <span className="text-xs">
                              {new Date(subscription.periodStart).toLocaleDateString()} - {new Date(subscription.periodEnd).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {subscription.trialStart && subscription.trialEnd ? (
                            <span className="text-xs">
                              {new Date(subscription.trialStart).toLocaleDateString()} - {new Date(subscription.trialEnd).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No trial</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono">
                            {subscription.stripeSubscriptionId || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs">
                            {subscription.updatedAt ? new Date(subscription.updatedAt).toLocaleString() : 
                             subscription.createdAt ? new Date(subscription.createdAt).toLocaleString() : "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center border rounded-md">
                <div className="text-center">
                  <p className="text-muted-foreground">No subscription activity found</p>
                  {searchQuery && <p className="text-sm mt-2">Try adjusting your search or filters</p>}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 