"use client"

import React from "react"
import { PlanSidebar } from "./components/PlanSidebar"
import { EditorContent } from "./components/EditorContent"
import { ChatPopover } from "./components/ChatPopover"

export function PlanUI() {
  return (
    <div className="flex h-screen w-full bg-background">
      <PlanSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <EditorContent />
        </main>
        <ChatPopover />
      </div>
    </div>
  )
}

export default PlanUI
