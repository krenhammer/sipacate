import React, { useState, useEffect, useRef } from "react"
import { useSnapshot } from "valtio"
import { Separator } from "@/components/ui/separator"
import { planState } from "../store/planState"
import { Step, Document } from "../types"
import { ReactEditor } from 'marktion';
import type { Marktion, ReactEditorRef } from 'marktion';


export function EditorContent() {
  const { selectedNode } = useSnapshot(planState)
  const [content, setContent] = useState("")
  const ref = useRef<ReactEditorRef>(null);


  // Update content when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      if (selectedNode.type === 'step') {
        ref?.current?.editor.setContent((selectedNode.data as Step).result || "")
      } else {
        ref?.current?.editor.setContent((selectedNode.data as Document).content || "")
      }
    } else {
      setContent("")
    }
  }, [selectedNode])

  // Save content to state when it changes
  const handleChange = (editor: Marktion) => {
    const newContent = editor.getContent()
    setContent(newContent)

    // if (selectedNode && planState.selectedNode) {
    //   if (selectedNode.type === 'step') {
    //     (planState.selectedNode.data as Step).result = newContent
    //     planState.selectedNode.data.updated = Date.now()
    //   } else if (selectedNode.type === 'document') {
    //     (planState.selectedNode.data as Document).content = newContent
    //     planState.selectedNode.data.updated = Date.now()
    //   }
    // }
  }


  // const getEditorContent = (): string => {
  //   if (!selectedNode) return ""

  //   if (selectedNode.type === 'step') {
  //     const content = (selectedNode.data as Step).result || ""
  //     console.log("Getting content for editor:", content.substring(0, 50));
  //     return content;
  //   } else {
  //     return (selectedNode.data as Document).content || ""
  //   }
  // }

  // Simple fallback display for content
  // const renderContent = () => {
  //   const content = getEditorContent()
  //   if (!content) return null

  //   return (
  //     <div className="prose max-w-none dark:prose-invert">
  //       <pre className="whitespace-pre-wrap p-4 bg-gray-100 dark:bg-gray-800 rounded">
  //         {content}
  //       </pre>
  //     </div>
  //   )
  // }

  // if (!selectedNode) {
  //   return (
  //     <div className="flex-1 p-6 overflow-auto">
  //       <div className="flex h-full justify-center items-center text-muted-foreground">
  //         <p>Select a step or document from the sidebar</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="h-full flex flex-col">

        {selectedNode && selectedNode.type === 'step' && (selectedNode.data as Step).result &&
          <div className="p-6 rounded-md  overflow-auto">
            <ReactEditor content={content} onChange={handleChange} ref={ref} className="border-0 dark:gray-500 p-2 rounded-lg select-none" />
          </div>
        }


      </div>
    </div>
  )
} 