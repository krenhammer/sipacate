import { useState, useEffect } from 'react';
import { PlanTemplate } from '../types';
import { toast } from '@/components/ui/use-toast';

export function usePlanTemplates() {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/plan-templates');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch templates');
      }
      
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new template
  const createTemplate = async (title: string, description?: string) => {
    try {
      setLoading(true);
      console.log("Creating template with:", { title, description });
      
      const response = await fetch('/api/plan-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("Error response data:", errorData);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          errorData = { error: `HTTP error ${response.status}` };
        }
        
        throw new Error(errorData.error || errorData.details || `Failed to create template (${response.status})`);
      }
      
      const data = await response.json();
      console.log("Success response:", data);
      
      setTemplates((prev) => [...prev, data.template]);
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
      return data.template;
    } catch (err) {
      console.error("Error in createTemplate:", err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create template',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a template
  const updateTemplate = async (id: string, title: string, description?: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/plan-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          title,
          description,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }
      
      const data = await response.json();
      
      setTemplates((prev) =>
        prev.map((template) => (template.id === id ? data.template : template))
      );
      
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
      
      return data.template;
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update template',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plan-templates?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }
      
      setTemplates((prev) => prev.filter((template) => template.id !== id));
      
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete template',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
} 