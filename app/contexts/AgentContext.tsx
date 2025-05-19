import { createContext, useContext, useState, ReactNode } from "react";
import { Agent } from "@/hooks/use-agents";

interface AgentContextType {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  isAgentSelected: boolean;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const isAgentSelected = !!selectedAgent;

  return (
    <AgentContext.Provider
      value={{
        selectedAgent,
        setSelectedAgent,
        isAgentSelected,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
} 