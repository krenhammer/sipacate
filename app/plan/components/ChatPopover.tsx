import React, { useState, useEffect } from "react"
import { MessagesSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSnapshot } from "valtio"
import { planState } from "../store/planState"
import { useRouter, useSearchParams } from "next/navigation"
import { Step, Document } from "../types"

export function ChatPopover() {
  const [chatInput, setChatInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { selectedNode } = useSnapshot(planState)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get the current node's instructions or content based on type
  const getNodeContent = () => {
    if (!selectedNode?.data) return "";
    
    if (selectedNode.type === 'document') {
      return (selectedNode.data as Document).content;
    } else {
      return (selectedNode.data as Step).instructions.replace(/^#.+\n+/, '');
    }
  };
  
  // Check URL for chat parameter
  useEffect(() => {
    const chatOpen = searchParams.get('chat') === 'open';
    setIsOpen(chatOpen);
  }, [searchParams]);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    // Update URL based on open state
    const url = new URL(window.location.href);
    if (open) {
      url.searchParams.set('chat', 'open');
    } else {
      url.searchParams.delete('chat');
    }
    
    // Use router.push with the updated URL pathname and search
    router.push(url.pathname + url.search);
  };

  // Prevent popover from closing when clicking outside
  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
  };
  
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Handle sending the message - would be implemented with actual chat functionality
      console.log("Sending message:", chatInput)
      setChatInput("")
    }
  }
  
  return (
    <div className="absolute bottom-4 right-4">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button className="rounded-full p-3">
            <MessagesSquare className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px]" 
          align="end" 
          onInteractOutside={handleInteractOutside}
          onPointerDownOutside={handleInteractOutside}
          onFocusOutside={handleInteractOutside}
        >
          <div className="py-2">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                {selectedNode?.name || "Chat Assistant"}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => handleOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedNode?.data && (
              <div className="text-xs text-muted-foreground mb-3">
                {getNodeContent()}
              </div>
            )}
            <div className="h-[300px] rounded-md p-3 bg-muted/20 border mb-3">
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 overflow-auto">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm">How can I help you with {selectedNode?.name || "your planning"} today?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex">
              <input
                type="textarea"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-l-md text-sm"
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
  )
} 