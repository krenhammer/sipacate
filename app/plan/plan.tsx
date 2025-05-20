"use client"

import React, { useState, useRef, useEffect } from "react"
import { proxy, useSnapshot } from "valtio"
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Layers, 
  MessagesSquare 
} from "lucide-react"
import { Tree } from "react-arborist"
import { Marktion } from "marktion"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Define Step and Document types
interface Step {
  id: string
  name: string
  instructions: string
  systemPrompt: string
  userPrompt: string
  result: string
  created: number
  updated: number
}

interface Document {
  id: string
  name: string
  content: string
  created: number
  updated: number
}

type TreeNode = {
  id: string
  name: string
  children?: TreeNode[]
  type: 'step' | 'document'
  data: Step | Document
}

// Create the state store with valtio
const planState = proxy({
  steps: [
    {
      id: "icp",
      name: "Ideal Customer Profile (ICP)",
      children: [],
      type: "step" as const,
      data: {
        id: "icp",
        name: "Ideal Customer Profile (ICP)",
        instructions: "# Create an Ideal Customer Profile\n\nDefine your target audience demographics, pain points, and goals.",
        systemPrompt: "You are an expert marketing consultant.",
        userPrompt: "Help me create an Ideal Customer Profile for my business.",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "personas",
      name: "Personas",
      children: [
        {
          id: "identify-buyers",
          name: "Identify Buyers",
          type: "step" as const,
          data: {
            id: "identify-buyers",
            name: "Identify Buyers",
            instructions: "# Identify Your Buyers\n\nList the key decision makers and influencers.",
            systemPrompt: "You are a B2B sales expert.",
            userPrompt: "Help me identify the key decision makers for my product.",
            result: "",
            created: Date.now(),
            updated: Date.now()
          }
        },
        {
          id: "one-pagers",
          name: "One Pagers",
          type: "step" as const,
          data: {
            id: "one-pagers",
            name: "One Pagers",
            instructions: "# Create One-Pager Documents\n\nCreate concise one-page summaries for each persona.",
            systemPrompt: "You are a marketing content specialist.",
            userPrompt: "Help me create effective one-pagers for my target personas.",
            result: "",
            created: Date.now(),
            updated: Date.now()
          }
        }
      ],
      type: "step" as const,
      data: {
        id: "personas",
        name: "Personas",
        instructions: "# Define Your Buyer Personas\n\nCreate detailed profiles of your ideal customers.",
        systemPrompt: "You are a customer research specialist.",
        userPrompt: "Help me create detailed buyer personas for my business.",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    }
  ] as TreeNode[],
  selectedNode: null as TreeNode | null,
  sidebarCollapsed: false
})

// Node component for the Tree
function NodeComponent({ node, style, dragHandle }: any) {
  const { isInternal } = node
  const { selectedNode } = useSnapshot(planState)
  
  const isSelected = selectedNode?.id === node.id
  
  return (
    <div
      ref={dragHandle}
      style={style}
      className={`flex items-center py-1 px-2 ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'} rounded-sm cursor-pointer`}
      onClick={() => {
        planState.selectedNode = node.data
      }}
    >
      {isInternal && (
        <button 
          className="mr-1 p-1 hover:bg-muted rounded-sm"
          onClick={() => node.toggle()}
        >
          {node.isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      )}
      <span className={`text-sm ${isInternal ? 'font-medium' : ''}`}>{node.data.name}</span>
    </div>
  )
}

// ChevronDown component
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
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
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

// MarkdownEditor component
function MarkdownEditor({ initialContent, onChange }: { initialContent: string, onChange: (content: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)

  useEffect(() => {
    if (editorRef.current && !editor) {
      try {
        const marktionInstance = new Marktion({
          initialMarkdown: initialContent,
          rootElement: editorRef.current
        })
        
        // Try to add a change handler if possible
        marktionInstance.on?.('change', (markdown: string) => {
          onChange(markdown)
        })
        
        setEditor(marktionInstance)
      } catch (error) {
        console.error("Error initializing Marktion:", error)
      }
    }

    return () => {
      // No cleanup needed as we're not storing the instance in a ref
    }
  }, [editorRef, initialContent, onChange, editor])

  return <div ref={editorRef} className="w-full h-full min-h-[400px]" />
}

export function PlanUI() {
  const [activeTab, setActiveTab] = useState<string>("steps")
  const { steps, selectedNode, sidebarCollapsed } = useSnapshot(planState)
  const [chatInput, setChatInput] = useState("")

  const handleEditorChange = (content: string) => {
    if (selectedNode) {
      if (selectedNode.type === 'step') {
        (selectedNode.data as Step).instructions = content
      } else {
        (selectedNode.data as Document).content = content
      }
    }
  }

  const getEditorContent = () => {
    if (!selectedNode) return ""
    
    if (selectedNode.type === 'step') {
      return (selectedNode.data as Step).instructions
    } else {
      return (selectedNode.data as Document).content
    }
  }

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Handle sending the message - would be implemented with actual chat functionality
      console.log("Sending message:", chatInput)
      setChatInput("")
    }
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <div className={`border-r transition-all ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem className="flex justify-between items-center w-full">
                <SidebarMenuButton size="lg" asChild>
                  <button>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Layers className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">VoltAgent Planner</span>
                    </div>
                  </button>
                </SidebarMenuButton>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => planState.sidebarCollapsed = !sidebarCollapsed}
                  className="ml-auto"
                >
                  {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          
          <SidebarContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="steps">
                  <Layers className="h-4 w-4 mr-2" />
                  Steps
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="steps" className="mt-2">
                <ScrollArea className="h-full">
                  <Tree
                    data={steps}
                    openByDefault={false}
                    width="100%"
                    height={500}
                    indent={16}
                    rowHeight={28}
                    paddingTop={10}
                    paddingBottom={10}
                    className="w-full"
                  >
                    {NodeComponent}
                  </Tree>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="history" className="mt-2">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Today</span>
                    </div>
                    <div className="space-y-2">
                      {steps.map((step) => (
                        <div key={step.id} className="p-2 hover:bg-muted rounded-sm cursor-pointer">
                          <p className="text-sm font-medium">{step.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(step.data.updated).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </SidebarContent>
          
          <SidebarRail />
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  {/* Empty footer */}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          {selectedNode ? (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">{selectedNode.name}</h1>
                <Separator className="my-4" />
              </div>
              <div className="flex-1">
                <MarkdownEditor 
                  initialContent={getEditorContent()} 
                  onChange={handleEditorChange} 
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full justify-center items-center text-muted-foreground">
              <p>Select a step or document from the sidebar</p>
            </div>
          )}
        </main>
        
        <div className="absolute bottom-4 right-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="rounded-full p-3">
                <MessagesSquare className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px]" align="end">
              <div className="py-2">
                <h2 className="text-lg font-semibold mb-3">Chat Assistant</h2>
                <div className="h-[300px] rounded-md p-3 bg-muted/20 border mb-3">
                  <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4 overflow-auto">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-sm">How can I help you with your planning today?</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-l-md"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage()
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="rounded-l-none"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

export default PlanUI
