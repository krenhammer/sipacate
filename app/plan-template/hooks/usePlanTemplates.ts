import { useState, useEffect } from 'react';
import { PlanTemplate, PlanStep, PlanItem, PlanStepItem, PlanItemType } from '../types';
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

  // Create template from imported YAML
  const createTemplateFromYaml = async (importedTemplate: PlanTemplate) => {
    try {
      setLoading(true);
      
      // First create the template
      const templateResponse = await fetch('/api/plan-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: importedTemplate.title,
          description: importedTemplate.description,
        }),
      });
      
      if (!templateResponse.ok) {
        const errorData = await templateResponse.json();
        throw new Error(errorData.error || 'Failed to create template');
      }
      
      const templateData = await templateResponse.json();
      const newTemplate = templateData.template;
      
      // If there are steps, create them
      if (importedTemplate.steps && importedTemplate.steps.length > 0) {
        for (const step of importedTemplate.steps) {
          // Create step
          const stepResponse = await fetch(`/api/plan-templates/${newTemplate.id}/steps`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: step.title,
              description: step.description,
            }),
          });
          
          if (!stepResponse.ok) {
            const errorData = await stepResponse.json();
            throw new Error(errorData.error || 'Failed to create step');
          }
          
          const stepData = await stepResponse.json();
          const newStep = stepData.step;
          
          // If the step has items, create them and link them
          if (step.planStepItems && step.planStepItems.length > 0) {
            for (const stepItem of step.planStepItems) {
              if (stepItem.planItem) {
                // Create the plan item
                const planItem = stepItem.planItem;
                const itemResponse = await fetch('/api/plan-items', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    title: planItem.title,
                    description: planItem.description,
                    type: planItem.type as PlanItemType,
                    instructions: planItem.instructions,
                    systemPrompt: planItem.systemPrompt,
                    userPrompt: planItem.userPrompt,
                  }),
                });
                
                if (!itemResponse.ok) {
                  const errorData = await itemResponse.json();
                  throw new Error(errorData.error || 'Failed to create item');
                }
                
                const itemData = await itemResponse.json();
                const newItem = itemData.item;
                
                // Add the item to the step
                await fetch(`/api/plan-templates/${newTemplate.id}/steps/${newStep.id}/items`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    planItemId: newItem.id,
                    order: stepItem.order,
                  }),
                });
              }
            }
          }
        }
      }
      
      // Fetch updated templates to include the newly created one with all its steps
      await fetchTemplates();
      
      return newTemplate;
    } catch (err) {
      console.error("Error importing template from YAML:", err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to import template',
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
    createTemplateFromYaml,
    updateTemplate,
    deleteTemplate,
  };
} 