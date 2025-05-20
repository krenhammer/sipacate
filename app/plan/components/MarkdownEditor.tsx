import React, { useState, useRef, useEffect } from "react"
import { Marktion } from "marktion"

// MarkdownEditor component
export function MarkdownEditor({ initialContent, onChange }: { initialContent: string, onChange: (content: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)

  useEffect(() => {
    if (editorRef.current && !editor) {
      try {
        // Create a basic element for Marktion
        const marktionInstance = new Marktion({
          container: editorRef.current,
          initialValue: initialContent,
          onChange: (value) => {
            onChange(value)
          }
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