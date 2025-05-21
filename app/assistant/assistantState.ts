import { proxy } from 'valtio';

export interface AssistantFile {
  id: string;
  assistantId: string;
  content: string;
  filename: string;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assistant {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  knowledge: string | null;
  organizationId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  files: AssistantFile[];
}

interface AssistantState {
  assistants: Assistant[];
  selectedAssistant: Assistant | null;
  isLoading: boolean;
  error: string | null;
}

export const assistantState = proxy<AssistantState>({
  assistants: [],
  selectedAssistant: null,
  isLoading: false,
  error: null,
});

export const assistantActions = {
  setSelectedAssistant: (assistant: Assistant | null) => {
    assistantState.selectedAssistant = assistant;
  },
  
  setAssistants: (assistants: Assistant[]) => {
    assistantState.assistants = assistants;
  },
  
  addAssistant: (assistant: Assistant) => {
    assistantState.assistants.push(assistant);
  },
  
  updateAssistant: (updatedAssistant: Assistant) => {
    const index = assistantState.assistants.findIndex(a => a.id === updatedAssistant.id);
    if (index !== -1) {
      assistantState.assistants[index] = updatedAssistant;
    }
    
    if (assistantState.selectedAssistant?.id === updatedAssistant.id) {
      assistantState.selectedAssistant = updatedAssistant;
    }
  },
  
  deleteAssistant: (id: string) => {
    assistantState.assistants = assistantState.assistants.filter(a => a.id !== id);
    
    if (assistantState.selectedAssistant?.id === id) {
      assistantState.selectedAssistant = null;
    }
  },
  
  setLoading: (loading: boolean) => {
    assistantState.isLoading = loading;
  },
  
  setError: (error: string | null) => {
    assistantState.error = error;
  }
}; 