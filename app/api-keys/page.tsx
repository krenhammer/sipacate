"use client"

import { useSession, useAdminStatus } from "@/hooks/use-auth-hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ApiKeyManager from "@/components/api-keys/api-key-manager"
import ApiKeyDocs from "@/components/api-keys/api-key-docs"
import ApiKeyTester from "@/components/api-keys/api-key-tester"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ApiKeysPage() {
    const { data: session } = useSession()
    const { isAdmin } = useAdminStatus()
    const router = useRouter()
    const isManager = session?.user?.role === "manager" || session?.user?.role === "mgr" || isAdmin
    
    // Redirect to dashboard if user is not a manager/admin or not logged in
    useEffect(() => {
        if (!session?.user) {
            router.push("/auth/sign-in")
        } else if (!isManager) {
            router.push("/dashboard")
        }
    }, [session, isManager, router])
    
    if (!session?.user || !isManager) {
        return (
            <div className="container px-4 md:px-6 py-12">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                    <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
                    <Button asChild>
                        <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                </div>
            </div>
        )
    }
    
    return (
        <div className="container px-4 md:px-6 py-12">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">API Keys</h1>
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            
            <Tabs defaultValue="manage" className="w-full">
                <TabsList>
                    <TabsTrigger value="manage">Manage API Keys</TabsTrigger>
                    <TabsTrigger value="docs">API Documentation</TabsTrigger>
                    <TabsTrigger value="test">Test API Key</TabsTrigger>
                </TabsList>
                <TabsContent value="manage">
                    <ApiKeyManager 
                        title={isAdmin ? "API Keys (Admin)" : "API Keys"} 
                        description="Manage API keys for programmatic access to the application."
                        maxKeys={isAdmin ? 10 : 5}
                    />
                </TabsContent>
                <TabsContent value="docs">
                    <ApiKeyDocs
                        apiEndpoint={`${window.location.origin}/api`}
                        sampleResponses={{
                            success: { 
                                status: "success", 
                                data: { 
                                    id: "rec_123abc", 
                                    name: "Example Resource",
                                    createdAt: new Date().toISOString()
                                } 
                            },
                            error: { 
                                status: "error", 
                                code: "unauthorized",
                                message: "Invalid API key" 
                            }
                        }}
                    />
                </TabsContent>
                <TabsContent value="test">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <ApiKeyTester />
                        </div>
                        <div className="md:col-span-1">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>API Key Testing Guide</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p>
                                            Use the API key tester to verify if your API keys are valid and have the 
                                            required permissions.
                                        </p>
                                        
                                        <div>
                                            <h3 className="font-medium mb-2">Testing with Permissions</h3>
                                            <p className="text-sm text-muted-foreground">
                                                To check if your API key has specific permissions, enter 
                                                the permissions in JSON format:
                                            </p>
                                            <pre className="mt-2 rounded-md bg-muted p-4 overflow-x-auto text-sm">
                                                <code>{JSON.stringify({
                                                    "resources": ["read", "write"]
                                                }, null, 2)}</code>
                                            </pre>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-medium mb-2">Common Errors</h3>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                <li>Invalid API key format</li>
                                                <li>API key does not exist</li>
                                                <li>API key is disabled</li>
                                                <li>API key has expired</li>
                                                <li>API key has insufficient permissions</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 