import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { chatHistory, type ChatThread } from "../lib/chatHistory";

interface ChatContextType {
  threads: ChatThread[];
  currentThreadId: string | null;
  setCurrentThreadId: (threadId: string) => void;
  createNewThread: () => Promise<string>;
  deleteThread: (threadId: string) => Promise<void>;
  refreshThreads: () => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);

  const refreshThreads = async () => {
    try {
      setIsLoading(true);
      const threadsFromDB = await chatHistory.getThreads();
      setThreads(threadsFromDB);
      
      // ONLY auto-select a thread on initial mount, not during refreshes
      if (isInitialMount.current && threadsFromDB.length > 0 && !currentThreadId) {
        isInitialMount.current = false;
        // Sort by createdAt descending and take the first (most recent)
        const mostRecentThread = [...threadsFromDB].sort((a, b) => b.createdAt - a.createdAt)[0];
        setCurrentThreadId(mostRecentThread.id);
      }
    } catch (error) {
      console.error("Failed to load threads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial mount effect - only runs once
  useEffect(() => {
    refreshThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetCurrentThreadId = (threadId: string) => {
    // Only set loading if changing to a different thread
    if (threadId !== currentThreadId) {
      setIsLoading(true);
    }
    setCurrentThreadId(threadId);
  };

  const createNewThread = async () => {
    setIsLoading(true);
    try {
      const newThreadId = await chatHistory.createThread();
      setCurrentThreadId(newThreadId);
      await refreshThreads();
      return newThreadId;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteThread = async (threadId: string) => {
    setIsLoading(true);
    try {
      await chatHistory.deleteThread(threadId);
      
      // If the deleted thread is the current one, select another thread if available
      if (threadId === currentThreadId) {
        // Get updated threads after deletion
        const remainingThreads = await chatHistory.getThreads();
        
        if (remainingThreads.length > 0) {
          // Sort by createdAt descending and take the first (most recent)
          const mostRecentThread = [...remainingThreads].sort((a, b) => b.createdAt - a.createdAt)[0];
          setCurrentThreadId(mostRecentThread.id);
        } else {
          // No threads left
          setCurrentThreadId(null);
        }
      }
      
      await refreshThreads();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        currentThreadId,
        setCurrentThreadId: handleSetCurrentThreadId,
        createNewThread,
        deleteThread,
        refreshThreads,
        isLoading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
} 