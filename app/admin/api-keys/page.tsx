"use client"

import { useState, useEffect, useMemo } from "react"
import { authClient } from "@/lib/auth-client"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ColumnDef, 
  createColumnHelper, 
} from "@tanstack/react-table"
import { 
  MoreVertical, 
  PlusCircle, 
  RefreshCw, 
  Key,
  Trash,
  Edit,
  Check,
  X,
  Copy,
  Calendar,
  Info
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { formatDistanceToNow, format } from "date-fns"

// Define the API Key type
type ApiKey = {
  id: string
  name: string
  start?: string
  prefix?: string
  userId: string
  enabled: boolean
  rateLimitEnabled: boolean
  rateLimitTimeWindow?: number
  rateLimitMax?: number
  requestCount: number
  remaining?: number
  refillInterval?: number
  refillAmount?: number
  lastRefillAt?: Date
  lastRequest?: Date
  expiresAt?: Date
  permissions?: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

// Create a form schema for new API key
const createApiKeySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  prefix: z.string().optional(),
  expiresIn: z.number().optional(),
  rateLimitEnabled: z.boolean().default(false),
  rateLimitTimeWindow: z.number().optional(),
  rateLimitMax: z.number().optional(),
  refillInterval: z.number().optional(),
  refillAmount: z.number().optional(),
  remaining: z.number().optional(),
  permissions: z.record(z.string(), z.array(z.string())).optional()
})

// Create a column helper for the API key table
const columnHelper = createColumnHelper<ApiKey>()

// Create table columns for API keys
const apiKeyColumns: ColumnDef<ApiKey, any>[] = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    )
  }),
  columnHelper.accessor("prefix", {
    header: "Prefix",
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.original.prefix || "-"}
        {row.original.start && <span className="ml-1 text-muted-foreground">...{row.original.start}</span>}
      </div>
    )
  }),
  columnHelper.accessor("enabled", {
    header: "Status",
    cell: ({ row }) => (
      <div>
        {row.original.enabled ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="destructive">Disabled</Badge>
        )}
      </div>
    )
  }),
  columnHelper.accessor("expiresAt", {
    header: "Expires",
    cell: ({ row }) => (
      <div>
        {row.original.expiresAt ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{formatDistanceToNow(new Date(row.original.expiresAt), { addSuffix: true })}</div>
              </TooltipTrigger>
              <TooltipContent>
                {format(new Date(row.original.expiresAt), "PPP")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">Never</span>
        )}
      </div>
    )
  }),
  columnHelper.accessor("rateLimitEnabled", {
    header: "Rate Limit",
    cell: ({ row }) => (
      <div>
        {row.original.rateLimitEnabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline">{row.original.rateLimitMax} / {formatTimeWindow(row.original.rateLimitTimeWindow)}</Badge>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.rateLimitMax} requests per {formatTimeWindow(row.original.rateLimitTimeWindow)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">Disabled</span>
        )}
      </div>
    )
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
      </div>
    )
  }),
  columnHelper.accessor("id", {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.id)}
              className="cursor-pointer"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateApiKeyStatus(row.original.id, !row.original.enabled)}
              className="cursor-pointer"
            >
              {row.original.enabled ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Disable
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Enable
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteApiKey(row.original.id)}
              className="cursor-pointer text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  })
]

// Helper function to format time windows
const formatTimeWindow = (ms?: number) => {
  if (!ms) return "unknown"
  
  const seconds = ms / 1000
  
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  
  return `${Math.floor(seconds / 86400)}d`
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [isViewPermissionsOpen, setIsViewPermissionsOpen] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null)
  
  // Create form for new API key
  const createApiKeyForm = useForm<z.infer<typeof createApiKeySchema>>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      prefix: "",
      expiresIn: undefined,
      rateLimitEnabled: false,
      rateLimitTimeWindow: 24 * 60 * 60 * 1000, // 1 day in ms
      rateLimitMax: 1000,
      remaining: undefined,
      refillInterval: undefined,
      refillAmount: undefined,
      permissions: {
        "resources": ["read"]
      }
    },
  })
  
  // Watch for rate limit enabled changes
  const rateLimitEnabled = createApiKeyForm.watch("rateLimitEnabled")
  
  // Function to fetch API keys
  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const { data, error } = await authClient.apiKey.list()
      
      if (error) {
        console.error("Failed to fetch API keys:", error)
        toast.error("Failed to load API keys")
        return
      }
      
      setApiKeys(data || [])
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
      toast.error("Failed to load API keys")
    } finally {
      setLoading(false)
    }
  }
  
  // Create a new API key
  const createApiKey = async (data: z.infer<typeof createApiKeySchema>) => {
    try {
      const { data: apiKey, error } = await authClient.apiKey.create({
        name: data.name,
        prefix: data.prefix,
        expiresIn: data.expiresIn,
        rateLimitEnabled: data.rateLimitEnabled,
        rateLimitTimeWindow: data.rateLimitEnabled ? data.rateLimitTimeWindow : undefined,
        rateLimitMax: data.rateLimitEnabled ? data.rateLimitMax : undefined,
        remaining: data.remaining,
        refillInterval: data.refillInterval,
        refillAmount: data.refillAmount,
        permissions: data.permissions
      })
      
      if (error) {
        console.error("Failed to create API key:", error)
        toast.error("Failed to create API key")
        return
      }
      
      // Store the newly created key to display to the user
      setNewApiKey(apiKey.key)
      toast.success("API key created successfully")
      fetchApiKeys()
    } catch (error) {
      console.error("Failed to create API key:", error)
      toast.error("Failed to create API key")
    }
  }
  
  // Update API key status (enable/disable)
  const updateApiKeyStatus = async (keyId: string, enabled: boolean) => {
    try {
      const { data, error } = await authClient.apiKey.update({
        keyId,
        enabled
      })
      
      if (error) {
        console.error("Failed to update API key:", error)
        toast.error("Failed to update API key")
        return
      }
      
      toast.success(`API key ${enabled ? "enabled" : "disabled"} successfully`)
      fetchApiKeys()
    } catch (error) {
      console.error("Failed to update API key:", error)
      toast.error("Failed to update API key")
    }
  }
  
  // Delete an API key
  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return
    }
    
    try {
      const { data, error } = await authClient.apiKey.delete({
        keyId
      })
      
      if (error) {
        console.error("Failed to delete API key:", error)
        toast.error("Failed to delete API key")
        return
      }
      
      toast.success("API key deleted successfully")
      fetchApiKeys()
    } catch (error) {
      console.error("Failed to delete API key:", error)
      toast.error("Failed to delete API key")
    }
  }
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof createApiKeySchema>) => {
    createApiKey(values)
  }
  
  // Load API keys on component mount
  useEffect(() => {
    fetchApiKeys()
  }, [])
  
  // Filter API keys based on search query and filters
  const filteredApiKeys = useMemo(() => {
    return apiKeys.filter(key => {
      const matchesSearch = searchQuery 
        ? key.name.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true
      
      const matchesStatus = filterEnabled !== null 
        ? key.enabled === filterEnabled 
        : true
      
      return matchesSearch && matchesStatus
    })
  }, [apiKeys, searchQuery, filterEnabled])
  
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access to the application.
          </p>
        </div>
        
        <Button onClick={() => {
          createApiKeyForm.reset()
          setIsCreateKeyOpen(true)
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={filterEnabled === null ? "all" : filterEnabled ? "active" : "disabled"}
            onValueChange={(value) => {
              if (value === "all") setFilterEnabled(null)
              else if (value === "active") setFilterEnabled(true)
              else setFilterEnabled(false)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchApiKeys}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* API Keys Table */}
      <DataTable 
        columns={apiKeyColumns} 
        data={filteredApiKeys} 
        loading={loading}
        noDataText="No API keys found"
      />
      
      {/* Create API Key Dialog */}
      <Dialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Add a new API key for programmatic access to the application.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createApiKeyForm}>
            <form onSubmit={createApiKeyForm.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="limits">Rate Limits & Expiration</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <FormField
                    control={createApiKeyForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="API Key Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          A name to identify this API key.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createApiKeyForm.control}
                    name="prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefix (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="my_app_" {...field} />
                        </FormControl>
                        <FormDescription>
                          An optional prefix to add to the API key.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="limits" className="space-y-4">
                  <FormField
                    control={createApiKeyForm.control}
                    name="expiresIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration (Optional)</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Expiration time in seconds" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : Number(e.target.value)
                                field.onChange(value)
                              }}
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormControl>
                          <span className="text-muted-foreground">seconds</span>
                        </div>
                        <FormDescription>
                          Time in seconds until this API key expires. Leave empty for no expiration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createApiKeyForm.control}
                    name="rateLimitEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Rate Limiting</FormLabel>
                          <FormDescription>
                            Enable rate limiting for this API key
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {rateLimitEnabled && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createApiKeyForm.control}
                          name="rateLimitMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Requests</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="1000" 
                                  {...field} 
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : Number(e.target.value)
                                    field.onChange(value)
                                  }}
                                  value={field.value === undefined ? "" : field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={createApiKeyForm.control}
                          name="rateLimitTimeWindow"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Window (ms)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="86400000" 
                                  {...field} 
                                  onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : Number(e.target.value)
                                    field.onChange(value)
                                  }}
                                  value={field.value === undefined ? "" : field.value}
                                />
                              </FormControl>
                              <FormDescription>
                                Time window in milliseconds (e.g., 86400000 = 1 day)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={createApiKeyForm.control}
                      name="remaining"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remaining Usage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Optional" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : Number(e.target.value)
                                field.onChange(value)
                              }}
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createApiKeyForm.control}
                      name="refillAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refill Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Optional" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : Number(e.target.value)
                                field.onChange(value)
                              }}
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createApiKeyForm.control}
                      name="refillInterval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refill Interval (ms)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Optional" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value === "" ? undefined : Number(e.target.value)
                                field.onChange(value)
                              }}
                              value={field.value === undefined ? "" : field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Permission Configuration
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Configure permissions for this API key. Define resources and allowed actions.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Resources</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">Resource</Label>
                            <Input placeholder="e.g., files" />
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground mb-1 block">Actions (comma separated)</Label>
                            <Input placeholder="e.g., read,write,delete" />
                          </div>
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateKeyOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create API Key</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Display New API Key Dialog */}
      <Dialog open={!!newApiKey} onOpenChange={(open) => !open && setNewApiKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Please copy your API key now. For security reasons, it won't be displayed again.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 mb-6">
            <Input
              value={newApiKey || ""}
              readOnly
              className="font-mono"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Make sure to store this key securely as it will not be displayed again.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                if (newApiKey) {
                  navigator.clipboard.writeText(newApiKey);
                  toast.success("API key copied to clipboard");
                }
                setNewApiKey(null);
                setIsCreateKeyOpen(false);
              }}
            >
              Copy and Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 