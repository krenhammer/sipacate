import { FC } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const VibeOpsRules: FC = () => {
  return (
    <div className="flex flex-col p-4 h-full">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Global Rules</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          No rules found
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-gray-500 dark:text-gray-400 px-1 py-0.5 h-auto"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          New rule file...
        </Button>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-2">Workspace Rules</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          No rules found
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-gray-500 dark:text-gray-400 px-1 py-0.5 h-auto"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          New rule file...
        </Button>
      </div>
    </div>
  );
}; 