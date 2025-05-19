import type { FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { PlusIcon, Trash2Icon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/contexts/ChatContext";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ThreadList: FC = () => {
  const { threads } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
      <ThreadListNew />
      <div className="px-1 pb-2">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search threads..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <CustomThreadListItems searchQuery={searchQuery} />
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  const { createNewThread } = useChat();

  const handleCreateThread = async () => {
    await createNewThread();
  };

  return (
    <Button 
      className="data-[active]:bg-muted hover:bg-muted flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start" 
      variant="ghost"
      onClick={handleCreateThread}
    >
      <PlusIcon />
      New Thread
    </Button>
  );
};

type CustomThreadListItemsProps = {
  searchQuery: string;
};

const CustomThreadListItems: FC<CustomThreadListItemsProps> = ({ searchQuery }) => {
  const { threads, currentThreadId, setCurrentThreadId } = useChat();

  const filteredThreads = threads.filter(thread => {
    const title = getThreadTitle(thread).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  if (threads.length === 0) {
    return (
      <div className="py-2 px-3 text-muted-foreground text-sm">
        No threads yet. Create a new one to start chatting.
      </div>
    );
  }

  if (filteredThreads.length === 0) {
    return (
      <div className="py-2 px-3 text-muted-foreground text-sm">
        No threads match your search.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {filteredThreads.map((thread) => {
        const isActive = currentThreadId === thread.id;
        return (
          <CustomThreadListItem 
            key={thread.id} 
            threadId={thread.id}
            isActive={isActive}
            title={getThreadTitle(thread)}
            onClick={() => {
              setCurrentThreadId(thread.id);
            }}
          />
        );
      })}
    </div>
  );
};

type CustomThreadListItemProps = {
  threadId: string;
  isActive: boolean;
  title: string;
  onClick: () => void;
};

const CustomThreadListItem: FC<CustomThreadListItemProps> = ({ 
  threadId, 
  isActive,
  title,
  onClick
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteThread } = useChat();
  
  const handleClick = () => {
    setIsClicked(true);
    onClick();
    
    // Reset the clicked state after animation
    setTimeout(() => setIsClicked(false), 300);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Skip confirmation for "New Chat" threads
    if (title === "New Chat") {
      await deleteThread(threadId);
      return;
    }
    
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    await deleteThread(threadId);
    setShowDeleteDialog(false);
  };
  
  return (
    <div 
      className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-all cursor-pointer group
        ${isActive ? 'bg-muted font-medium' : ''}
        ${isClicked ? 'bg-muted/80' : ''}`}
      role="button"
      onClick={handleClick}
    >
      <span className="flex-grow text-sm truncate">{title}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7" 
        onClick={handleDelete}
      >
        <Trash2Icon className="h-4 w-4 text-destructive" />
      </Button>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Thread</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this thread? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper to get the title of a thread from its first message or fallback to a default
function getThreadTitle(thread: { messages: Array<{ content: string | any[] }> }): string {
  if (thread.messages.length === 0) {
    return "New Chat";
  }
  
  // Get the first message content
  const content = thread.messages[0]?.content;
  
  // Handle multi-modal content
  if (Array.isArray(content)) {
    // Try to find the first text part
    const textPart = content.find(part => part.type === 'text');
    if (textPart && textPart.text) {
      const text = textPart.text;
      return text.length <= 35 ? text : text.substring(0, 35) + "...";
    }
    
    // If no text part found, indicate it's a message with attachments
    return "Message with attachments";
  }
  
  // Handle simple text content
  const firstMessage = content || "";
  if (firstMessage.length <= 35) {
    return firstMessage;
  }
  return firstMessage.substring(0, 35) + "...";
}
