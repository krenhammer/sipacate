"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2, XCircle, Send } from "lucide-react"

interface ApiKeyTesterProps {
  className?: string
  onTest?: (result: TestResult) => void
}

interface TestResult {
  valid: boolean
  error?: {
    message: string
    code: string
  } | null
  key?: any
}

export default function ApiKeyTester({ className, onTest }: ApiKeyTesterProps) {
  const [apiKey, setApiKey] = useState("")
  const [permissions, setPermissions] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  
  // Function to test the API key
  const testApiKey = async () => {
    if (!apiKey) return
    
    setLoading(true)
    setResult(null)
    
    try {
      // Parse permissions if provided
      let parsedPermissions = undefined
      if (permissions.trim()) {
        try {
          parsedPermissions = JSON.parse(permissions)
        } catch (err) {
          setResult({
            valid: false,
            error: {
              message: "Invalid permissions JSON format",
              code: "invalid_format"
            }
          })
          setLoading(false)
          return
        }
      }
      
      // Make the API request to verify the key
      const response = await fetch('/api/api-keys/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: apiKey,
          permissions: parsedPermissions
        })
      })
      
      const data = await response.json()
      
      setResult(data)
      if (onTest) onTest(data)
    } catch (error) {
      console.error("Error testing API key:", error)
      setResult({
        valid: false,
        error: {
          message: "Failed to test API key",
          code: "request_failed"
        }
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Test API Key</CardTitle>
        <CardDescription>
          Verify your API key and check its permissions.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="api-key">
            API Key
          </label>
          <Input
            id="api-key"
            type="text"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="permissions">
            Permissions (Optional - JSON format)
          </label>
          <Textarea
            id="permissions"
            placeholder={`Example: {"resources": ["read"]}`}
            value={permissions}
            onChange={(e) => setPermissions(e.target.value)}
            className="min-h-[80px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter permissions to check if the API key has the required access.
          </p>
        </div>
        
        {result && (
          <Alert variant={result.valid ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {result.valid ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {result.valid ? "API Key Valid" : "API Key Invalid"}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {result.error ? (
                <div className="text-sm">
                  <p><strong>Error:</strong> {result.error.message}</p>
                  <p><strong>Code:</strong> {result.error.code}</p>
                </div>
              ) : result.key ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium">Key ID:</div>
                    <div className="col-span-2 font-mono">{result.key.id}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium">Name:</div>
                    <div className="col-span-2">{result.key.name}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium">Status:</div>
                    <div className="col-span-2">
                      <Badge variant={result.key.enabled ? "success" : "destructive"}>
                        {result.key.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  
                  {result.key.permissions && (
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="font-medium">Permissions:</div>
                      <div className="col-span-2 font-mono text-xs break-all">
                        {result.key.permissions}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={testApiKey} 
          disabled={loading || !apiKey.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Test API Key
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 