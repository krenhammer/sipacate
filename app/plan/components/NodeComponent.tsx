import React from "react"
import { useSnapshot } from "valtio"
import { planState } from "../store/planState"
import { ChevronDown } from "./ChevronDown"
import { ChevronRight } from "lucide-react"

// Node component for the Tree
export function NodeComponent({ node, style, dragHandle }: any) {
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