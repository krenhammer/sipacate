import * as React from "react"
import { MessagesSquare, PanelLeft } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ThreadList } from "./assistant-ui/thread-list"
import { TooltipIconButton } from "./assistant-ui/tooltip-icon-button"
import { useEffect } from "react"

// URL parameter constants
export const SIDEBAR_VISIBLE_PARAM = "sidebar";
export const DEFAULT_SIDEBAR_VISIBILITY = false;

// Helper function to generate URLs with sidebar visibility parameter
export const getSidebarUrl = (baseUrl: string = "/", isVisible: boolean = DEFAULT_SIDEBAR_VISIBILITY): string => {
  const url = new URL(baseUrl, window.location.origin);
  
  // Set sidebar visibility parameter
  url.searchParams.set(SIDEBAR_VISIBLE_PARAM, isVisible.toString());
  
  return url.toString();
};

export type AppSidebarProps = {
  onToggle?: () => void;
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ onToggle, ...props }: AppSidebarProps) {
  const handleToggle = () => {
    // Update URL when sidebar is toggled
    const url = new URL(window.location.href);
    const currentVisibility = url.searchParams.get(SIDEBAR_VISIBLE_PARAM) !== 'false';
    url.searchParams.set(SIDEBAR_VISIBLE_PARAM, (!currentVisibility).toString());
    window.history.replaceState({}, '', url.toString());
    
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-between items-center w-full">
            <SidebarMenuButton size="lg" asChild>
                <button>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <MessagesSquare className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">vibeops</span>
                  </div>
                </button>
              </SidebarMenuButton>
              
            <TooltipIconButton
              tooltip="Toggle Sidebar"
              onClick={handleToggle}
              variant="ghost"
              className="ml-auto"
            >
              <PanelLeft className="size-4" />
            </TooltipIconButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ThreadList />
      </SidebarContent>
      
      <SidebarRail />
      <SidebarFooter>
        <SidebarMenu>
         
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              {/* Empty content - keep it simple with no asChild prop */}
            </SidebarMenuButton>
            
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
