import { SampleFrame } from "./sample-frame";

import { BotIcon, ChevronDownIcon, HistoryIcon, PlusIcon, PanelLeft } from "lucide-react";
import { FaFolder, FaScaleBalanced, FaGear, FaRobot } from "react-icons/fa6";
import { IoChatbox } from "react-icons/io5";

import { type FC, forwardRef, useState, useEffect, useRef } from "react";
import { AssistantModalPrimitive, ThreadPrimitive } from "@assistant-ui/react";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

import { AgentSelector } from "@/components/agent-selector";
import { useChat } from "@/contexts/ChatContext";
import { ViewContainer } from "./modal/ViewContainer";
import { DEFAULT_VIEW, ModalViewType, VIEW_PARAM, OPEN_PARAM } from "./modal/types";
import { useNavigate } from "@/router";
import { SIDEBAR_VISIBLE_PARAM, DEFAULT_SIDEBAR_VISIBILITY } from "../app-sidebar";
import { projectFolders } from "@/lib/projectFolders";
import { onProjectFolderChanged } from "@/lib/events";

// Default modal visibility
export const DEFAULT_MODAL_VISIBILITY = false;

// Helper function to generate modal URLs
export const getModalUrl = (
  baseUrl: string = "/", 
  view: ModalViewType = DEFAULT_VIEW,
  isOpen: boolean = DEFAULT_MODAL_VISIBILITY
): string => {
  const url = new URL(baseUrl, window.location.origin);
  
  // Set modal to open/closed
  if (isOpen) {
    url.searchParams.set(OPEN_PARAM, 'true');
  } else {
    url.searchParams.delete(OPEN_PARAM);
  }
  
  // Only set view param if it's not the default
  if (view !== DEFAULT_VIEW) {
    url.searchParams.set(VIEW_PARAM, view);
  } else {
    url.searchParams.delete(VIEW_PARAM);
  }
  
  return url.toString();
};

export const AssistantModalSample = () => {
  // Create sample URL with modal visible for the sample
  const sampleUrl = getModalUrl("/", DEFAULT_VIEW, true);
  
  return (
    <SampleFrame sampleText="Sample Assistant Modal">
      <div className="pt-10">
        <AssistantModal />
      </div>
    </SampleFrame>
  );
};

export type AssistantModalProps = {
  onToggleHistory?: () => void;
};

export const AssistantModal: FC<AssistantModalProps> = ({ onToggleHistory }) => {
  const { currentThreadId, isLoading, createNewThread } = useChat();
  const [activeView, setActiveView] = useState<ModalViewType>(DEFAULT_VIEW);
  const [shouldOpen, setShouldOpen] = useState(DEFAULT_MODAL_VISIBILITY);
  const [hasProjectFolder, setHasProjectFolder] = useState(false);
  const [currentProjectPath, setCurrentProjectPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const hasRunInitialCheckRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  
  // Check if a project folder exists
  const checkProjectFolder = async () => {
    try {
      const currentFolder = await projectFolders.getCurrentFolder();
      const folderExists = !!currentFolder;
      
      // Only update state if it changed to avoid re-renders
      if (folderExists !== hasProjectFolder) {
        setHasProjectFolder(folderExists);
      }
      
      // Update current project path
      if (currentFolder) {
        setCurrentProjectPath(currentFolder.path);
      } else {
        setCurrentProjectPath(null);
      }
    } catch (error) {
      console.error("Error checking project folder:", error);
    }
  };

  // Make function available globally for debugging, but don't re-create it on every render
  useEffect(() => {
    // @ts-ignore
    window.forceProjectFolderCheck = checkProjectFolder;
    
    return () => {
      // @ts-ignore
      delete window.forceProjectFolderCheck;
    };
  }, []);
  
  // Run a manual check once on initial render
  useEffect(() => {
    if (!hasRunInitialCheckRef.current) {
      checkProjectFolder();
      hasRunInitialCheckRef.current = true;
    }
  }, []);

  // Effect to handle URL parameters for view type and modal open state
  useEffect(() => {
    const url = new URL(window.location.href);
    const viewParam = url.searchParams.get(VIEW_PARAM);
    const openParam = url.searchParams.get(OPEN_PARAM);
    const sidebarParam = url.searchParams.get(SIDEBAR_VISIBLE_PARAM);
    
    // Check if modal should be opened
    if (openParam === 'true') {
      setShouldOpen(true);
    }
    
    // Set active view if valid
    if (viewParam && isValidViewType(viewParam)) {
      setActiveView(viewParam as ModalViewType);
    }
    
    // Initialize sidebar parameter if it doesn't exist
    if (sidebarParam === null) {
      url.searchParams.set(SIDEBAR_VISIBLE_PARAM, DEFAULT_SIDEBAR_VISIBILITY.toString());
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Effect to check for project folder changes
  useEffect(() => {
    // Listen for project folder changes using our custom event
    const unsubscribe = onProjectFolderChanged(() => {
      checkProjectFolder();
    });

    // Set up interval check but prevent multiple intervals
    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        checkProjectFolder();
      }, 5000);
    }

    return () => {
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Helper to validate view type
  const isValidViewType = (view: string): boolean => {
    return ['messages', 'project', 'rules', 'settings', 'model'].includes(view);
  };

  // Update URL when view changes
  const updateUrlWithView = (view: ModalViewType) => {
    const url = new URL(window.location.href);
    
    if (view === DEFAULT_VIEW) {
      url.searchParams.delete(VIEW_PARAM);
    } else {
      url.searchParams.set(VIEW_PARAM, view);
    }
    
    // Keep the modal open param if modal is open
    if (shouldOpen) {
      url.searchParams.set(OPEN_PARAM, 'true');
    }
    
    window.history.replaceState({}, '', url.toString());
  };

  const handleViewChange = (view: ModalViewType) => {
    // If settings is selected, navigate to the settings page
    if (view === 'settings') {
      navigate("/settings");
      return;
    }
    
    setActiveView(view);
    updateUrlWithView(view);
  };

  const handleToggleHistory = () => {
    // Read current sidebar visibility from URL
    const url = new URL(window.location.href);
    const currentVisibility = url.searchParams.get(SIDEBAR_VISIBLE_PARAM) !== 'false';
    
    // Toggle the sidebar visibility in URL
    url.searchParams.set(SIDEBAR_VISIBLE_PARAM, (!currentVisibility).toString());
    window.history.replaceState({}, '', url.toString());
    
    // Call the onToggleHistory prop if provided
    if (onToggleHistory) {
      onToggleHistory();
    }
  };

  const handleNewThread = async () => {
    await createNewThread();
  };

  const handleToggleSidebar = () => {
    // Toggle sidebar visibility in URL
    const url = new URL(window.location.href);
    const currentVisibility = url.searchParams.get(SIDEBAR_VISIBLE_PARAM) !== 'false';
    url.searchParams.set(SIDEBAR_VISIBLE_PARAM, (!currentVisibility).toString());
    window.history.replaceState({}, '', url.toString());
    
    // If there's a direct onToggleHistory prop, call it too
    if (onToggleHistory) {
      onToggleHistory();
    }
  };

  // Function to read current sidebar visibility from URL
  const getSidebarVisibility = (): boolean => {
    const url = new URL(window.location.href);
    return url.searchParams.get(SIDEBAR_VISIBLE_PARAM) !== 'false';
  };

  // Update modal visibility in URL when it changes
  const handleModalOpenChange = (open: boolean) => {
    setShouldOpen(open);
    
    const url = new URL(window.location.href);
    
    if (open) {
      url.searchParams.set(OPEN_PARAM, 'true');
    } else {
      url.searchParams.delete(OPEN_PARAM);
    }
    
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <AssistantModalPrimitive.Root open={shouldOpen} onOpenChange={handleModalOpenChange}>
      <AssistantModalPrimitive.Anchor className="absolute bottom-4 right-4 size-11">
        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out data-[state=open]:zoom-in data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 z-50 h-[500px] w-[400px] overflow-clip rounded-xl border p-0 shadow-md outline-none flex flex-col [&>.aui-thread-root]:bg-inherit"
      >
        {activeView === 'messages' && (
          <div className="m-2 shrink-0 flex items-center gap-2">
            <div className="flex-grow"><AgentSelector/></div>
            <TooltipIconButton
              tooltip={getSidebarVisibility() ? "Hide History" : "Show History"}
              onClick={handleToggleHistory}
              variant="ghost"
            >
              <HistoryIcon className="size-5" />
            </TooltipIconButton>
            <TooltipIconButton
              tooltip="New Thread"
              onClick={handleNewThread}
              variant="ghost"
            >
              <PlusIcon className="size-5" />
            </TooltipIconButton>
          </div>
        )}
        
        <div className="flex-grow overflow-y-auto">
          <ViewContainer activeView={activeView} />
        </div>
        
        <div className="border-t p-2 flex space-x-2">
         
          
          <TooltipIconButton
            // tooltip={currentProjectPath ? `Project: ${currentProjectPath}` : "Select a Project to begin"}
            tooltip={currentProjectPath ? `Change Project` : "Select a Project to begin"}
            onClick={() => handleViewChange('project')}
            variant="ghost"
            className={activeView === 'project' ? 'text-foreground' : 'text-muted-foreground opacity-50'}
          >
            <FaFolder className="size-5" />
          </TooltipIconButton>
          
         
          
          <TooltipIconButton
            tooltip="Rules"
            onClick={() => handleViewChange('rules')}
            variant="ghost"
            className={activeView === 'rules' ? 'text-foreground' : 'text-muted-foreground opacity-50'}
          >
            <FaScaleBalanced className="size-5" />
          </TooltipIconButton>
          
          <TooltipIconButton
            tooltip="Settings"
            onClick={() => handleViewChange('settings')}
            variant="ghost"
            className="text-muted-foreground opacity-50"
          >
            <FaGear className="size-5" />
          </TooltipIconButton>
          
          <TooltipIconButton
            tooltip="Model Selection"
            onClick={() => handleViewChange('model')}
            variant="ghost"
            className={activeView === 'model' ? 'text-foreground' : 'text-muted-foreground opacity-50'}
          >
            <FaRobot className="size-5" />
          </TooltipIconButton>
          <TooltipIconButton
            tooltip="Messages"
            onClick={() => handleViewChange('messages')}
            variant="ghost"
            className={activeView === 'messages' ? 'text-foreground' : 'text-muted-foreground opacity-50'}
            disabled={!hasProjectFolder}
            data-test-has-project={hasProjectFolder ? "true" : "false"}
          >
            <IoChatbox className="size-5" />
          </TooltipIconButton>
          
          {/* Project Path Display */}
          <div className="ml-auto">
            {currentProjectPath && (
              <div 
                className="mt-1 text-xs text-muted-foreground hover:text-foreground truncate max-w-[160px] cursor-pointer flex items-center justify-end"
                onClick={() => handleViewChange('project')}
                title={`Current Project: ${currentProjectPath}`}
              >
                <span className="truncate">{currentProjectPath}</span>
              </div>
            )}
          </div>
        </div>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};

type AssistantModalButtonProps = { "data-state"?: "open" | "closed" };

const AssistantModalButton = forwardRef<
  HTMLButtonElement,
  AssistantModalButtonProps
>(({ "data-state": state, ...rest }, ref) => {
  const tooltip = state === "open" ? "Close Assistant" : "Open Assistant";

  return (
    <TooltipIconButton
      variant="default"
      tooltip={tooltip}
      side="left"
      {...rest}
      className="size-full rounded-full shadow transition-transform hover:scale-110 active:scale-90"
      ref={ref}
    >
      <BotIcon
        data-state={state}
        className="absolute size-6 transition-all data-[state=closed]:rotate-0 data-[state=open]:rotate-90 data-[state=closed]:scale-100 data-[state=open]:scale-0"
      />

      <ChevronDownIcon
        data-state={state}
        className="absolute size-6 transition-all data-[state=closed]:-rotate-90 data-[state=open]:rotate-0 data-[state=closed]:scale-0 data-[state=open]:scale-100"
      />
      <span className="sr-only">{tooltip}</span>
    </TooltipIconButton>
  );
});

AssistantModalButton.displayName = "AssistantModalButton";