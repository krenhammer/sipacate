import { FC, useState, useEffect, useRef } from "react";
import { ModalViewType } from "./types";
import { Messages } from "./Messages";
import { SelectProject } from "./SelectProject";
import { VibeOpsRules } from "./VibeOpsRules";
import { ModelSelection } from "./ModelSelection";
import { projectFolders } from "@/lib/projectFolders";
import { onProjectFolderChanged, dispatchProjectFolderChanged } from "@/lib/events";

interface ViewContainerProps {
  activeView: ModalViewType;
}

export const ViewContainer: FC<ViewContainerProps> = ({ activeView }) => {
  const [hasProjectFolder, setHasProjectFolder] = useState(false);
  const hasCheckedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const checkProjectFolder = async () => {
    if (!hasCheckedRef.current) {
      console.log("ViewContainer: Initial project folder check");
    }
    
    try {
      const currentFolder = await projectFolders.getCurrentFolder();
      const folderExists = !!currentFolder;
      
      // Only update state if it changed to avoid re-renders
      if (folderExists !== hasProjectFolder) {
        console.log("ViewContainer: Folder status changed:", folderExists);
        setHasProjectFolder(folderExists);
      }
      
      hasCheckedRef.current = true;
    } catch (error) {
      console.error("Error checking project folder:", error);
    }
  };

  useEffect(() => {
    // Initial check
    checkProjectFolder();

    // Listen for project folder changes using our custom event
    const unsubscribe = onProjectFolderChanged(() => {
      checkProjectFolder();
    });

    // Periodic check for project folder changes - but only once every 5 seconds
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
  }, [activeView]); // Only re-run when activeView changes

  switch (activeView) {
    case 'messages':
      // If no project folder is selected, redirect to project selection
      return hasProjectFolder ? <Messages /> : <SelectProject />;
    case 'project':
      return <SelectProject />;
    case 'rules':
      return <VibeOpsRules />;
    case 'settings':
      // Settings is handled separately by navigating to the settings page
      return null;
    case 'model':
      return <ModelSelection />;
    default:
      return hasProjectFolder ? <Messages /> : <SelectProject />;
  }
}; 