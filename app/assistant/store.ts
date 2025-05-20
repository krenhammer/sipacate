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

export const assistantStore = proxy<AssistantState>({
  assistants: [],
  selectedAssistant: null,
  isLoading: false,
  error: null,
});

export const assistantActions = {
  setSelectedAssistant: (assistant: Assistant | null) => {
    assistantStore.selectedAssistant = assistant;
  },
  
  setAssistants: (assistants: Assistant[]) => {
    assistantStore.assistants = assistants;
  },
  
  addAssistant: (assistant: Assistant) => {
    assistantStore.assistants.push(assistant);
  },
  
  updateAssistant: (updatedAssistant: Assistant) => {
    const index = assistantStore.assistants.findIndex(a => a.id === updatedAssistant.id);
    if (index !== -1) {
      assistantStore.assistants[index] = updatedAssistant;
    }
    
    if (assistantStore.selectedAssistant?.id === updatedAssistant.id) {
      assistantStore.selectedAssistant = updatedAssistant;
    }
  },
  
  deleteAssistant: (id: string) => {
    assistantStore.assistants = assistantStore.assistants.filter(a => a.id !== id);
    
    if (assistantStore.selectedAssistant?.id === id) {
      assistantStore.selectedAssistant = null;
    }
  },
  
  setLoading: (loading: boolean) => {
    assistantStore.isLoading = loading;
  },
  
  setError: (error: string | null) => {
    assistantStore.error = error;
  }
}; 