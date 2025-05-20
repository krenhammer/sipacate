import React from "react"
import { useSnapshot } from "valtio"
import { planState } from "../store/planState"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Step, TreeNode } from "../types"

// Function to check if any child node has a result or is selected
const hasChildWithResultOrSelected = (node: any, selectedNodeId: string | undefined): boolean => {
  if (!node.children || node.children.length === 0) return false
  
  return node.children.some((child: any) => {
    // Check if this child has a result
    const hasResult = child.data.type === 'step' && (child.data.data as Step).result
    
    // Check if this child is selected
    const isChildSelected = child.id === selectedNodeId
    
    // Recursively check child's children
    const hasChildResult = hasChildWithResultOrSelected(child, selectedNodeId)
    
    return hasResult || isChildSelected || hasChildResult
  })
}

// Node component for the Tree
export function NodeComponent({ node, style, dragHandle }: any) {
  const { isInternal } = node
  const { selectedNode } = useSnapshot(planState)
  
  const isSelected = selectedNode?.id === node.id
  
  // Check if node has a child with result or selected
  const hasChildWithResult = isInternal ? hasChildWithResultOrSelected(node, selectedNode?.id) : false
  
  // Check if step has no result (only applies to step nodes)
  const hasNoResult = node.data.type === 'step' && !(node.data.data as Step).result
  
  // Only dim if it has no result AND doesn't have a child with result or selected
  const shouldDim = hasNoResult && !hasChildWithResult && !isSelected
  
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
      <span className={`text-sm ${isInternal ? 'font-medium' : ''} ${isSelected ? 'font-bold' : ''} ${shouldDim ? 'dark:text-gray-600 text:gray-400' : ''}`}>
        {node.data.name}
      </span>
    </div>
  )
} 