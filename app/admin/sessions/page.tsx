"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { 
  ColumnDef, 
  createColumnHelper 
} from "@tanstack/react-table"
import { 
  MoreVertical, 
  RefreshCw, 
  XCircle,
  UserX,
  Search
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
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

// Define the Session and User types
type Session = {
  id: string
  token: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  ipAddress?: string
  userAgent?: string
  userId: string
  impersonatedBy?: string
  user?: User
}

type User = {
  id: string
  name: string
  email: string
}

// Create a column helper for the session table
const columnHelper = createColumnHelper<Session>()

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("")
  const [isUserSessionsOpen, setIsUserSessionsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [viewingUserSessions, setViewingUserSessions] = useState(false)

  // Function to fetch all active sessions
  const fetchAllSessions = async () => {
    try {
      setLoading(true)
      setViewingUserSessions(false)
      // We need to fetch all users first
      const usersResponseResult = await authClient.admin.listUsers({
        query: {
          limit: 50
        }
      })

      const usersResponse = usersResponseResult.data;
      
      if (usersResponse && 'users' in usersResponse && Array.isArray(usersResponse.users)) {
        setUsers(usersResponse.users)
        
        // Then fetch sessions for each user
        let allSessions: Session[] = []
        
        // Only load sessions for the first 10 users to avoid too many requests
        const firstTenUsers = usersResponse.users.slice(0, 10)
        
        for (const user of firstTenUsers) {
          const sessionsResponseResult = await authClient.admin.listUserSessions({
            userId: user.id
          })

          const sessionsResponse = sessionsResponseResult.data;
          
          if (sessionsResponse && 'sessions' in sessionsResponse && Array.isArray(sessionsResponse.sessions)) {
            // Add user information to each session
            const userSessionsWithInfo = sessionsResponse.sessions.map(session => ({
              ...session,
              user: {
                id: user.id,
                name: user.name,
                email: user.email
              }
            }))
            
            allSessions = [...allSessions, ...userSessionsWithInfo as Session[]]
          }
        }
        
        setSessions(allSessions)
      } else {
        throw new Error("Invalid response from listUsers")
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      toast.error("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch sessions for a specific user
  const fetchUserSessions = async (userId: string) => {
    try {
      setLoading(true)
      setViewingUserSessions(true)
      
      const user = users.find(u => u.id === userId)
      if (!user) {
        throw new Error("User not found")
      }
      
      const sessionsResponse = await authClient.admin.listUserSessions({
        userId
      })
      
      if (sessionsResponse && 'sessions' in sessionsResponse && Array.isArray(sessionsResponse.sessions)) {
        // Add user information to each session
        const userSessionsWithInfo = sessionsResponse.sessions.map(session => ({
          ...session,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }))
        
        setSessions(userSessionsWithInfo)
        setSelectedUser(user)
      } else {
        throw new Error("Invalid sessions response")
      }
    } catch (error) {
      console.error("Failed to fetch user sessions:", error)
      toast.error("Failed to load user sessions")
    } finally {
      setLoading(false)
    }
  }
  
  // Function to revoke a specific session
  const revokeSession = async (sessionToken: string) => {
    try {
      await authClient.admin.revokeUserSession({
        sessionToken
      })
      
      toast.success("Session revoked successfully")
      
      // Refresh the sessions list
      if (viewingUserSessions && selectedUser) {
        fetchUserSessions(selectedUser.id)
      } else {
        fetchAllSessions()
      }
    } catch (error) {
      console.error("Failed to revoke session:", error)
      toast.error("Failed to revoke session")
    }
  }
  
  // Function to revoke all sessions for a user
  const revokeAllUserSessions = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke all sessions for this user?")) {
      return
    }
    
    try {
      await authClient.admin.revokeUserSessions({
        userId
      })
      
      toast.success("All user sessions revoked successfully")
      
      // Refresh the sessions list
      if (viewingUserSessions) {
        fetchUserSessions(userId)
      } else {
        fetchAllSessions()
      }
    } catch (error) {
      console.error("Failed to revoke all user sessions:", error)
      toast.error("Failed to revoke all user sessions")
    }
  }
  
  // Filter users based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        user => 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])
  
  // Define columns for the sessions table
  const columns: ColumnDef<Session, any>[] = [
    columnHelper.accessor(row => row.user?.name, {
      id: "userName",
      header: "User",
      cell: (info) => info.getValue() || "Unknown",
    }),
    columnHelper.accessor(row => row.user?.email, {
      id: "userEmail",
      header: "Email",
      cell: (info) => info.getValue() || "Unknown",
    }),
    columnHelper.accessor("ipAddress", {
      header: "IP Address",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("userAgent", {
      header: "User Agent",
      cell: (info) => {
        const userAgent = info.getValue()
        if (!userAgent) return "N/A"
        
        // Truncate long user agent strings
        return userAgent.length > 30 
          ? `${userAgent.substring(0, 30)}...` 
          : userAgent
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor("expiresAt", {
      header: "Expires",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor("impersonatedBy", {
      header: "Impersonated",
      cell: (info) => info.getValue() 
        ? <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">Yes</span>
        : "No",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const session = info.row.original
        
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
              <DropdownMenuItem onClick={() => revokeSession(session.token)}>
                <XCircle className="mr-2 h-4 w-4" /> Revoke Session
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => revokeAllUserSessions(session.userId)}>
                <UserX className="mr-2 h-4 w-4" /> Revoke All User Sessions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }),
  ]
  
  // Fetch all sessions on component mount
  useEffect(() => {
    fetchAllSessions()
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {viewingUserSessions && selectedUser 
            ? `Sessions for ${selectedUser.name}` 
            : "All Active Sessions"}
        </h2>
        <div className="flex gap-2">
          {viewingUserSessions && (
            <Button onClick={fetchAllSessions} variant="outline" size="sm">
              Show All Sessions
            </Button>
          )}
          <Button 
            onClick={() => viewingUserSessions && selectedUser 
              ? fetchUserSessions(selectedUser.id) 
              : fetchAllSessions()} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Dialog open={isUserSessionsOpen} onOpenChange={setIsUserSessionsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Search className="mr-2 h-4 w-4" /> Find User Sessions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Find User Sessions</DialogTitle>
                <DialogDescription>
                  Search for a user to view their active sessions.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Search for User
                  </label>
                  <Input
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      No users found
                    </p>
                  ) : (
                    filteredUsers.map(user => (
                      <button
                        key={user.id}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setUserId(user.id)
                          fetchUserSessions(user.id)
                          setIsUserSessionsOpen(false)
                        }}
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsUserSessionsOpen(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="rounded-md border">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading sessions...</p>
            </div>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={sessions} 
            searchKey="userEmail" 
            searchPlaceholder="Search by user email..."
          />
        )}
      </div>
    </div>
  )
} 