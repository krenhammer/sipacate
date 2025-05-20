import React from "react"
import { useSnapshot } from "valtio"
import { Separator } from "@/components/ui/separator"
import { planState } from "../store/planState"
import { Step, Document } from "../types"
import { MarkdownEditor } from "./MarkdownEditor"

export function EditorContent() {
  const { selectedNode } = useSnapshot(planState)

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

  return (
    <div className="flex-1 p-6 overflow-auto">
      {selectedNode ? (
        <div className="h-full flex flex-col">
          {/* <div className="mb-4">
            <h1 className="text-2xl font-bold">{selectedNode.name}</h1>
            <Separator className="my-4" />
          </div>
          <div className="flex-1"> */}
            <MarkdownEditor 
              initialContent={getEditorContent()} 
              onChange={handleEditorChange} 
            />
          {/* </div> */}
        </div>
      ) : (
        <div className="flex h-full justify-center items-center text-muted-foreground">
          <p>Select a step or document from the sidebar</p>
        </div>
      )}
    </div>
  )
} 