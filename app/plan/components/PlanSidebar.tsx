import React, { useState, useRef, useEffect } from "react"
import { useSnapshot } from "valtio"
import { ChevronLeft, ChevronRight, Clock, Layers } from "lucide-react"
import { Tree } from "react-arborist"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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

import { planState } from "../store/planState"
import { NodeComponent } from "./NodeComponent"

export function PlanSidebar() {
  const { steps, sidebarCollapsed } = useSnapshot(planState)
  const [activeTab, setActiveTab] = useState<string>("steps")
  const treeRef = useRef(null)
  const [lastOpenId, setLastOpenId] = useState<string | null>(null)

  // Custom handler for toggling nodes
  const handleToggle = (id: string) => {
    if (!treeRef.current) return

    const tree = treeRef.current
    
    // Check if the node is already open
    const isCurrentlyOpen = tree.isOpen(id)
    
    // If we're opening a node, close the previously open one first
    if (!isCurrentlyOpen && lastOpenId && lastOpenId !== id) {
      tree.close(lastOpenId)
    }
    
    // Toggle the clicked node
    tree.toggle(id)
    
    // Update the last open ID if we just opened a node
    if (!isCurrentlyOpen) {
      setLastOpenId(id)
    } else if (id === lastOpenId) {
      setLastOpenId(null)
    }
  }

  return (
    <div className={`border-r transition-all ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'} h-full`}>
      <Sidebar className="h-full">
        {/* <SidebarHeader className="mt-20">
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
        </SidebarHeader> */}
        
        <SidebarContent className="mt-20 mx-2 h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
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
                  ref={treeRef}
                  data={steps}
                  openByDefault={false}
                  width="100%"
                  indent={16}
                  rowHeight={28}
                  paddingTop={10}
                  paddingBottom={10}
                  className="w-full"
                  onToggle={handleToggle}
                >
                  {NodeComponent}
                </Tree>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="history" className="mt-2 h-full">
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
  )
} 