import { useState, useCallback } from 'react';
import { useSnapshot } from 'valtio';
import { assistantState, assistantActions, Assistant } from '../assistantState';
import { AssistantFormData } from '../types';

export function useAssistants() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { assistants, selectedAssistant } = useSnapshot(assistantState);

  const fetchAssistants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/assistants');
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      assistantActions.setAssistants(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assistants';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAssistant = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/assistants/${id}`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assistant';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAssistant = useCallback(async (data: AssistantFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      assistantActions.addAssistant(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create assistant';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAssistant = useCallback(async (data: AssistantFormData & { id: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/assistants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      assistantActions.updateAssistant(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update assistant';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAssistant = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/assistants?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      assistantActions.deleteAssistant(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete assistant';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectAssistant = useCallback((assistant: Assistant | null) => {
    assistantActions.setSelectedAssistant(assistant);
  }, []);

  return {
    assistants,
    selectedAssistant,
    isLoading,
    error,
    fetchAssistants,
    getAssistant,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    selectAssistant
  };
} 