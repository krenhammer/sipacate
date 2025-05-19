"use client"

import React from "react"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Copy, Info } from "lucide-react"
import { toast } from "sonner"

// Code block component
const CodeBlock = ({ 
  language = "json",
  code, 
  title,
  description
}: { 
  language?: string
  code: string
  title?: string
  description?: string
}) => {
  return (
    <div className="rounded-md bg-muted overflow-hidden">
      {title && (
        <div className="bg-muted/80 border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{title}</span>
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(code)
              toast.success("Code copied to clipboard")
            }}
            className="h-8 px-2"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}
      <pre className="overflow-x-auto p-4">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}

// API key usage examples
const apiKeyExamples = {
  fetch: `// Using fetch
const response = await fetch('https://your-api.com/data', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const data = await response.json();`,
  node: `// Using Node.js and Axios
const axios = require('axios');

const response = await axios.get('https://your-api.com/data', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const data = response.data;`,
  python: `# Using Python and requests
import requests

headers = {
    'x-api-key': 'YOUR_API_KEY'
}

response = requests.get('https://your-api.com/data', headers=headers)
data = response.json()`,
  curl: `# Using cURL
curl -X GET \\
  -H "x-api-key: YOUR_API_KEY" \\
  https://your-api.com/data`
}

// Error handling examples
const errorHandlingExamples = {
  fetch: `// Error handling with fetch
try {
  const response = await fetch('https://your-api.com/data', {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    // Handle error based on status code and error message
    if (response.status === 401) {
      // Unauthorized - invalid API key
    } else if (response.status === 429) {
      // Rate limit exceeded
    }
    throw new Error('API request failed');
  }
  
  const data = await response.json();
} catch (error) {
  console.error('Request failed:', error);
}`,
  node: `// Error handling with Axios
const axios = require('axios');

try {
  const response = await axios.get('https://your-api.com/data', {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });
  
  const data = response.data;
} catch (error) {
  console.error('API Error:', error.response?.data || error.message);
  
  // Handle error based on status code
  if (error.response?.status === 401) {
    // Unauthorized - invalid API key
  } else if (error.response?.status === 429) {
    // Rate limit exceeded
  }
}`
}

interface ApiKeyDocsProps {
  apiEndpoint?: string
  className?: string
  sampleResponses?: Record<string, any>
}

export default function ApiKeyDocs({
  apiEndpoint = "https://api.example.com",
  className = "",
  sampleResponses = {
    success: { 
      status: "success", 
      data: { id: "123", name: "Example Resource" } 
    },
    error: { 
      status: "error", 
      message: "Invalid API key" 
    }
  }
}: ApiKeyDocsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>API Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Authentication</h3>
          <p className="text-muted-foreground mb-4">
            To authenticate API requests, include your API key in the request headers.
          </p>
          <CodeBlock 
            language="json"
            title="Authentication Header"
            code={`{
  "x-api-key": "YOUR_API_KEY"
}`}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Usage Examples</h3>
          <Tabs defaultValue="fetch">
            <TabsList className="mb-4">
              <TabsTrigger value="fetch">JavaScript</TabsTrigger>
              <TabsTrigger value="node">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fetch">
              <CodeBlock 
                language="javascript"
                code={apiKeyExamples.fetch}
                title="Using fetch API"
              />
            </TabsContent>
            
            <TabsContent value="node">
              <CodeBlock 
                language="javascript"
                code={apiKeyExamples.node}
                title="Using Node.js and Axios"
              />
            </TabsContent>
            
            <TabsContent value="python">
              <CodeBlock 
                language="python"
                code={apiKeyExamples.python}
                title="Using Python requests"
              />
            </TabsContent>
            
            <TabsContent value="curl">
              <CodeBlock 
                language="bash"
                code={apiKeyExamples.curl}
                title="Using cURL"
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Error Handling</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="errors">
              <AccordionTrigger>Common Error Codes</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-5 gap-4 font-medium">
                    <div>Status</div>
                    <div className="col-span-4">Description</div>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>401</div>
                    <div className="col-span-4">Invalid or missing API key</div>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>403</div>
                    <div className="col-span-4">API key doesn't have required permissions</div>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>404</div>
                    <div className="col-span-4">Resource not found</div>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div>429</div>
                    <div className="col-span-4">Rate limit exceeded</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="error-examples">
              <AccordionTrigger>Error Handling Examples</AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="fetch" className="mt-2">
                  <TabsList className="mb-4">
                    <TabsTrigger value="fetch">JavaScript</TabsTrigger>
                    <TabsTrigger value="node">Node.js</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="fetch">
                    <CodeBlock 
                      language="javascript"
                      code={errorHandlingExamples.fetch}
                      title="Error handling with fetch"
                    />
                  </TabsContent>
                  
                  <TabsContent value="node">
                    <CodeBlock 
                      language="javascript"
                      code={errorHandlingExamples.node}
                      title="Error handling with Axios"
                    />
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Response Examples</h3>
          <Tabs defaultValue="success">
            <TabsList className="mb-4">
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>
            
            <TabsContent value="success">
              <CodeBlock 
                language="json"
                code={JSON.stringify(sampleResponses.success, null, 2)}
                title="Successful Response"
              />
            </TabsContent>
            
            <TabsContent value="error">
              <CodeBlock 
                language="json"
                code={JSON.stringify(sampleResponses.error, null, 2)}
                title="Error Response"
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
} 