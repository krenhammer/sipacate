import { useState } from 'react';
import { PlanStep } from '../types';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

export function usePlanSteps(templateId: string) {
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch steps for a template
  const fetchSteps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient<{ steps: PlanStep[] }>(`/api/plan-templates/${templateId}/steps`);
      setSteps(data.steps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch steps');
    } finally {
      setLoading(false);
    }
  };

  // Create a new step
  const createStep = async (title: string, description?: string) => {
    try {
      setLoading(true);
      
      const data = await apiClient<{ step: PlanStep }>(`/api/plan-templates/${templateId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      
      setSteps((prev) => [...prev, data.step]);
      
      toast.success('Step created successfully');
      
      return data.step;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create step');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a step
  const updateStep = async (stepId: string, title: string, description?: string) => {
    try {
      setLoading(true);
      
      const data = await apiClient<{ step: PlanStep }>(`/api/plan-templates/${templateId}/steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      
      setSteps((prev) =>
        prev.map((step) => (step.id === stepId ? data.step : step))
      );
      
      toast.success('Step updated successfully');
      
      return data.step;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update step');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a step
  const deleteStep = async (stepId: string) => {
    try {
      setLoading(true);
      
      await apiClient(`/api/plan-templates/${templateId}/steps/${stepId}`, {
        method: 'DELETE',
      });
      
      setSteps((prev) => prev.filter((step) => step.id !== stepId));
      
      toast.success('Step deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete step');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reorder items in a step
  const reorderItems = async (stepId: string, items: { id: string, order: number }[]) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plan-templates/${templateId}/steps/${stepId}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reorder items');
      }
      
      // Update the local state with the new order
      setSteps((prev) => {
        return prev.map((step) => {
          if (step.id === stepId && step.planStepItems) {
            const updatedItems = [...step.planStepItems];
            
            // Update the order of each item
            items.forEach((item) => {
              const index = updatedItems.findIndex((i) => i.id === item.id);
              if (index !== -1) {
                updatedItems[index] = { ...updatedItems[index], order: item.order };
              }
            });
            
            return {
              ...step,
              planStepItems: updatedItems.sort((a, b) => a.order - b.order),
            };
          }
          return step;
        });
      });
      
      toast.success('Items reordered successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reorder items');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    steps,
    loading,
    error,
    fetchSteps,
    createStep,
    updateStep,
    deleteStep,
    reorderItems,
  };
} 