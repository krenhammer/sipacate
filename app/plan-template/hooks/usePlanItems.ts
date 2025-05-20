import { useState } from 'react';
import { PlanItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export function usePlanItems() {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/plan-items');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch items');
      }
      
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new item
  const createItem = async (itemData: {
    title: string;
    description?: string;
    type: 'List' | 'Document';
    instructions?: string;
    systemPrompt?: string;
    userPrompt?: string;
    planStepId?: string; // Optional if creating standalone item
    order?: number; // Optional for ordering in a step
  }) => {
    try {
      setLoading(true);
      const response = await fetch('/api/plan-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }
      
      const data = await response.json();
      setItems((prev) => [...prev, data.item]);
      toast({
        title: 'Success',
        description: 'Item created successfully',
      });
      return data.item;
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create item',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an item
  const updateItem = async (
    id: string,
    itemData: {
      title?: string;
      description?: string;
      type?: 'List' | 'Document';
      instructions?: string;
      systemPrompt?: string;
      userPrompt?: string;
    }
  ) => {
    try {
      setLoading(true);
      const response = await fetch('/api/plan-items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...itemData,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }
      
      const data = await response.json();
      
      setItems((prev) =>
        prev.map((item) => (item.id === id ? data.item : item))
      );
      
      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
      
      return data.item;
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update item',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an item
  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plan-items?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
      
      setItems((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete item',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add an item to a step
  const addItemToStep = async (planItemId: string, planStepId: string, order?: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/plan-items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planItemId,
          planStepId,
          order,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item to step');
      }
      
      toast({
        title: 'Success',
        description: 'Item added to step successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add item to step',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    addItemToStep,
  };
} 