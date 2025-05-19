import { AppSidebar, SIDEBAR_VISIBLE_PARAM, DEFAULT_SIDEBAR_VISIBILITY } from "@/components/app-sidebar";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

export function VibeOps() {
  const [showHistory, setShowHistory] = useState(DEFAULT_SIDEBAR_VISIBILITY);

  // Effect to read URL parameters on component mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const sidebarParam = url.searchParams.get(SIDEBAR_VISIBLE_PARAM);
    
    // Only update if the parameter exists in the URL
    if (sidebarParam !== null) {
      setShowHistory(sidebarParam !== 'false');
    } else {
      // If no parameter, set the default and update URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set(SIDEBAR_VISIBLE_PARAM, DEFAULT_SIDEBAR_VISIBILITY.toString());
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="flex h-screen w-full bg-muted/30">
      {showHistory && (
        <div className="w-64 border-r">
          <SidebarProvider>
            <AppSidebar onToggle={toggleHistory} />
          </SidebarProvider>
        </div>
      )}
      <div className="flex-1 relative">
        <div className="flex justify-center items-center h-full">
          <h1 className="text-2xl font-bold">VoltAgent Assistant</h1>
        </div>
        <AssistantModal onToggleHistory={toggleHistory} />
      </div>
    </div>
  );
}