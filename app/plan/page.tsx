"use client"

import PlanUI from "./plan"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function PlanPage() {
  return (
    <SidebarProvider>
      <PlanUI />
    </SidebarProvider>
  )
} 