import React, { useState } from "react"
import { useSnapshot } from "valtio"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { planTemplateState } from "@/app/plan-template/store/planTemplateState"
import { planState } from "../store/planState"
import { TreeView, TreeDataItem } from "@/components/tree-view"
import { Step } from "../types"

// Safety method to fix typing issues with Valtio proxies
const asAny = <T,>(value: T): any => value as any;

export function PlanSidebar() {
  const { steps, sidebarCollapsed, selectedNode } = useSnapshot(planState)
  const { selectedTemplate } = useSnapshot(planTemplateState)
  
  // Function to check if a node has content
  const hasNodeContent = (node: any): boolean => {
    return node.type === 'step' && Boolean(node.data.result);
  };
  
  // Function to count children with content and total children (recursively)
  const countChildren = (node: any): { withContent: number, total: number } => {
    if (!node.children || node.children.length === 0) {
      return { withContent: 0, total: 0 };
    }
    
    let withContent = 0;
    let total = 0;
    
    // Count direct children first
    for (const child of node.children) {
      total++;
      
      // Check if this child has content
      if (hasNodeContent(child)) {
        withContent++;
      }
      
      // Recursively count for nested children
      if (child.children && child.children.length > 0) {
        const { withContent: childWithContent, total: childTotal } = countChildren(child);
        withContent += childWithContent;
        total += childTotal;
      }
    }
    
    return { withContent, total };
  };
  
  // Transform the steps data to match TreeDataItem format
  const treeData = React.useMemo(() => {
    // Create a mapping function that handles nested structure
    const mapNode = (node: any): TreeDataItem => {
      // Check if this node has content
      const hasContent = hasNodeContent(node);
      
      // Node is selected
      const isSelected = selectedNode?.id === node.id;
      
      // Check if this is a parent node
      const isParent = node.children && node.children.length > 0;
      
      // For parent nodes, add child counts to the name
      let displayName = node.name;
      
      if (isParent) {
        const { withContent, total } = countChildren(node);
        
        // Only add counter if there are children
        if (total > 0) {
          // Add counter with a styled span
          displayName = (
            <>
              {node.name} <span className="text-xs opacity-60 text-muted-foreground font-normal">({withContent}/{total})</span>
            </>
          );
        }
      }
      
      // Dim leaf nodes without content
      const shouldDim = !hasContent && !isSelected && !isParent;
      
      return {
        id: node.id,
        name: displayName,
        disabled: shouldDim,
        children: node.children?.map(mapNode)
      };
    };
    
    return asAny(steps).map(mapNode);
  }, [steps, selectedNode]);

  // Handle tree item selection
  const handleSelectChange = (item: TreeDataItem | undefined) => {
    if (item) {
      // Find the corresponding step
      const findNode = (items: any[], id: string): any => {
        for (const item of items) {
          if (item.id === id) return item;
          if (item.children) {
            const found = findNode(item.children, id);
            if (found) return found;
          }
        }
        return null;
      };
      
      const selected = findNode(asAny(steps), item.id);
      if (selected) {
        planState.selectedNode = selected;
        console.log("Selected:", selected.name);
      }
    }
  };

  return (
    <div className={`border-r transition-all ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'} h-full`}>
      <Sidebar className="h-full">        
        <SidebarContent className="mt-20 mx-2 h-full">
          {/* Current Plan Template Button */}
          {selectedTemplate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start mb-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    asChild
                  >
                    <Link href={`/plan-template/${selectedTemplate.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      {selectedTemplate.title}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Plan Template: {selectedTemplate.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TreeView 
            data={treeData}
            className="h-full custom-tree-view"
            onSelectChange={handleSelectChange}
            expandAll={false}
            initialSelectedItemId={selectedNode?.id}
          />
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
      
      {/* Add custom CSS for the tree view */}
      <style jsx global>{`
        .custom-tree-view {
          font-size: 0.875rem; /* 14px */
        }
        
        .custom-tree-view [data-disabled="true"] {
          opacity: 0.5;
          color: var(--gray-400);
        }
        
        .custom-tree-view [data-state="active"] {
          font-weight: bold;
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
      `}</style>
    </div>
  )
} 