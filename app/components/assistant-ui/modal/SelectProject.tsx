import { FC, useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectFolders, type ProjectFolder } from "@/lib/projectFolders";
import { PlusIcon, Trash2Icon, SearchIcon, XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { onProjectFolderChanged, dispatchProjectFolderChanged } from "@/lib/events";

export const SelectProject: FC = () => {
  const [inputPath, setInputPath] = useState<string>("");
  const [recentFolders, setRecentFolders] = useState<ProjectFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<ProjectFolder | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [folderToDelete, setFolderToDelete] = useState<ProjectFolder | null>(null);
  const hasDispatchedRef = useRef(false);
  
  // Load recent folders and current folder on component mount - only once
  useEffect(() => {
    loadFolders();
  }, []);
  
  // Load or reload folders
  const loadFolders = async () => {
    try {
      const current = await projectFolders.getCurrentFolder();
      
      // Only update state if something changed to avoid re-renders
      if (JSON.stringify(current) !== JSON.stringify(currentFolder)) {
        setCurrentFolder(current);
      }
      
      // Only dispatch folder change event if we have a current folder and haven't dispatched yet
      if (current && !hasDispatchedRef.current) {
        hasDispatchedRef.current = true;
        dispatchProjectFolderChanged();
      }
      
      // Load filtered or all folders for the recent list
      if (searchTerm) {
        const filtered = await projectFolders.filterFolders(searchTerm);
        setRecentFolders(filtered);
      } else {
        const folders = await projectFolders.getAllFolders();
        setRecentFolders(folders);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };
  
  // Handle browse button click
  const handleBrowse = async () => {
    try {
      // Use the File System Access API to select a directory
      // @ts-ignore - TypeScript might not recognize this API yet
      const directoryHandle = await window.showDirectoryPicker();
      
      // Since the File System Access API doesn't provide the full path directly,
      // we need to build a path based on what we can access
      // Note: This will typically only show the folder name, not the full system path due to security restrictions
      
      // For web security reasons, we can access the name but not the full path
      // We'll try to construct as much of the path as we can
      let path = '';
      
      try {
        // Try to get a file within the directory to potentially access more path info
        const relativePaths = [];
        let currentHandle = directoryHandle;
        
        // Add the current directory name
        relativePaths.unshift(currentHandle.name);
        
        // Build the path with what we have
        path = '/' + relativePaths.join('/');
      } catch (e) {
        // If we can't access more path info, just use the directory name
        path = '/' + directoryHandle.name;
      }
      
      // Set the selected path to the input
      setInputPath(path);
    } catch (error) {
      // User cancelled the dialog or browser doesn't support the API
      console.error("Error selecting directory:", error);
    }
  };
  
  // Handle select button click
  const handleSelect = async () => {
    if (inputPath) {
      try {
        await projectFolders.saveFolder(inputPath);
        setInputPath("");
        await loadFolders();
        
        // Force notification to parent components directly
        dispatchProjectFolderChanged();
        
        // Force view change to messages if a folder was selected
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'messages');
        window.history.pushState({}, '', url.toString());
        
        // Simulate a navigation event
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (error) {
        console.error("Error selecting folder:", error);
      }
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    setInputPath("");
  };
  
  // Handle clicking on a recent project
  const handleSelectRecentProject = async (folder: ProjectFolder) => {
    try {
      await projectFolders.saveFolder(folder.path);
      await loadFolders();
      
      // Force notification to parent components
      dispatchProjectFolderChanged();
      
      // Force view change to messages
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'messages');
      window.history.pushState({}, '', url.toString());
      
      // Simulate a navigation event
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (error) {
      console.error("Error selecting recent folder:", error);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = (folder: ProjectFolder, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the folder when clicking delete
    setFolderToDelete(folder);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete of a project folder
  const handleConfirmDelete = async () => {
    if (folderToDelete && folderToDelete.id) {
      await projectFolders.deleteFolder(folderToDelete.id);
      setDeleteDialogOpen(false);
      setFolderToDelete(null);
      await loadFolders();
    }
  };
  
  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = await projectFolders.filterFolders(value);
    setRecentFolders(filtered);
  };
  
  // Handle clicking on current project path to open folder picker
  const handleCurrentPathClick = () => {
    if (currentFolder) {
      // Simply set the input path to the current folder path for easy editing
      setInputPath(currentFolder.path);
      
      // Focus the input field
      setTimeout(() => {
        const inputElement = document.querySelector('input[placeholder="Enter or paste project path..."]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
          // Select all text to make it easy to replace
          inputElement.select();
        }
      }, 0);
    }
  };
  
  // Clear search filter
  const handleClearSearch = () => {
    setSearchTerm("");
    // Use an empty search term to get all folders
    projectFolders.filterFolders("").then(folders => {
      setRecentFolders(folders);
    });
  };
  
  const isCurrentProject = !!currentFolder;
  
  return (
    <div className="flex flex-col p-4 h-full">
      <h2 className="text-xl font-bold mb-1">
        {isCurrentProject ? "Current Project" : "Select Project"}
      </h2>
      
      {isCurrentProject && (
        <p 
          className="text-sm text-muted-foreground mb-4 truncate cursor-pointer hover:text-foreground"
          onClick={handleCurrentPathClick}
          title="Click to edit the current project path"
        >
          {currentFolder?.path}
        </p>
      )}
      
      <div className="flex gap-2 mb-4">
        <Input 
          className="flex-grow" 
          placeholder="Enter or paste project path..." 
          value={inputPath}
          onChange={(e) => setInputPath(e.target.value)}
        />
        <Button 
          variant="default" 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleBrowse}
        >
          Browse...
        </Button>
      </div>
      
      <div className="flex gap-2 mb-6">
        <Button 
          variant="default" 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSelect}
          disabled={!inputPath}
        >
          Select
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleCancel}
          disabled={!inputPath}
        >
          Cancel
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-md font-medium">Recent</h3>
        <div className="flex-grow relative">
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-8 h-8 text-sm"
            placeholder="Filter projects..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
              title="Clear filter"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col space-y-1 text-sm overflow-y-auto flex-grow">
        {recentFolders.length > 0 ? (
          recentFolders.map((folder) => (
            <div 
              key={folder.id} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center justify-between cursor-pointer group"
              onClick={() => handleSelectRecentProject(folder)}
            >
              <div className="truncate flex-grow text-muted-foreground group-hover:text-foreground transition-colors">{folder.path}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDeleteClick(folder, e)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-2 text-muted-foreground italic">No recent projects</div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove "{folderToDelete?.path}" from your recent projects?
            This won't delete the actual folder from your system.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 