import React, { useState } from "react"
import { MessagesSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ChatPopover() {
  const [chatInput, setChatInput] = useState("")
  
  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // Handle sending the message - would be implemented with actual chat functionality
      console.log("Sending message:", chatInput)
      setChatInput("")
    }
  }
  
  return (
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
  )
} 