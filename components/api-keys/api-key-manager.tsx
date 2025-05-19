"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { 
  PlusCircle, 
  Key, 
  Copy, 
  Trash,
  Clock, 
  RefreshCw,
  Check,
  X
} from "lucide-react"

// Define the API Key type
type ApiKey = {
  id: string
  name: string
  start?: string
  prefix?: string
  enabled: boolean
  expiresAt?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
}

// Create a form schema for new API key
const createApiKeySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  prefix: z.string().optional(),
  expiresIn: z.number().optional(),
})

interface ApiKeyManagerProps {
  title?: string
  description?: string
  showTitle?: boolean
  maxKeys?: number
  className?: string
}

export default function ApiKeyManager({
  title = "API Keys",
  description = "Manage your API keys for programmatic access to the API.",
  showTitle = true,
  maxKeys = 5,
  className = "",
}: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  
  // Create form for new API key
  const createApiKeyForm = useForm<z.infer<typeof createApiKeySchema>>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      prefix: "",
      expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    },
  })
  
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
      })
      
      if (error) {
        console.error("Failed to create API key:", error)
        toast.error("Failed to create API key")
        return
      }
      
      // Store the newly created key to display to the user
      setNewApiKey(apiKey.key)
      toast.success("API key created successfully")
      createApiKeyForm.reset()
      setIsCreateKeyOpen(false)
      fetchApiKeys()
    } catch (error) {
      console.error("Failed to create API key:", error)
      toast.error("Failed to create API key")
    }
  }
  
  // Delete an API key
  const deleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return
    }
    
    try {
      const { error } = await authClient.apiKey.delete({
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
  
  // Check if user has reached max keys
  const reachedMaxKeys = apiKeys.length >= maxKeys
  
  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Existing API keys */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-8 w-[70px]" />
              </div>
            ))
          ) : apiKeys.length > 0 ? (
            apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{key.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}</span>
                    {key.expiresAt && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="ml-2 cursor-help">
                              <Clock className="h-3 w-3 mr-1" />
                              Expires {formatDistanceToNow(new Date(key.expiresAt), { addSuffix: true })}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            This API key will expire {formatDistanceToNow(new Date(key.expiresAt), { addSuffix: true })}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {!key.enabled && (
                      <Badge variant="destructive">Disabled</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(key.id)
                            toast.success("API key ID copied to clipboard")
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy API key ID</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Copy API key ID
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteApiKey(key.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete API key</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Delete API key
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No API keys found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first API key to get started
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchApiKeys}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <Button
          onClick={() => setIsCreateKeyOpen(true)}
          disabled={reachedMaxKeys}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {reachedMaxKeys ? `Max limit (${maxKeys}) reached` : "Create API Key"}
        </Button>
      </CardFooter>
      
      {/* Create API Key Dialog */}
      <Dialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Add a new API key for programmatic access to the API.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createApiKeyForm}>
            <form onSubmit={createApiKeyForm.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <FormField
                control={createApiKeyForm.control}
                name="expiresIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Time (seconds)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Expiration time in seconds" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Time in seconds until this API key expires. Default is 30 days.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              }}
            >
              Copy and Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 