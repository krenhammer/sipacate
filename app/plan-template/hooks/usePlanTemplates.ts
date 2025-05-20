import { useState, useEffect } from 'react';
import { PlanTemplate, PlanStep, PlanItem, PlanStepItem, PlanItemType } from '../types';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

export function usePlanTemplates() {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient<{ templates: PlanTemplate[] }>('/api/plan-templates');
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Create a new template
  const createTemplate = async (title: string, description?: string) => {
    try {
      setLoading(true);
      console.log("Creating template with:", { title, description });
      
      const data = await apiClient<{ template: PlanTemplate }>('/api/plan-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });
      
      console.log("Success response:", data);
      
      setTemplates((prev) => [...prev, data.template]);
      toast.success('Template created successfully');
      return data.template;
    } catch (err) {
      console.error("Error in createTemplate:", err);
      toast.error(err instanceof Error ? err.message : 'Failed to create template');
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
      const templateData = await apiClient<{ template: PlanTemplate }>('/api/plan-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: importedTemplate.title,
          description: importedTemplate.description,
        }),
      });
      
      const newTemplate = templateData.template;
      
      // If there are steps, create them
      if (importedTemplate.steps && importedTemplate.steps.length > 0) {
        for (const step of importedTemplate.steps) {
          // Create step
          const stepData = await apiClient<{ step: PlanStep }>(`/api/plan-templates/${newTemplate.id}/steps`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: step.title,
              description: step.description,
            }),
          });
          
          const newStep = stepData.step;
          
          // If the step has items, create them and link them
          if (step.planStepItems && step.planStepItems.length > 0) {
            for (const stepItem of step.planStepItems) {
              if (stepItem.planItem) {
                // Create the plan item
                const planItem = stepItem.planItem;
                const itemData = await apiClient<{ item: PlanItem }>('/api/plan-items', {
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
                
                const newItem = itemData.item;
                
                // Add the item to the step
                await apiClient(`/api/plan-templates/${newTemplate.id}/steps/${newStep.id}/items`, {
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
      toast.error(err instanceof Error ? err.message : 'Failed to import template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a template
  const updateTemplate = async (id: string, title: string, description?: string) => {
    try {
      setLoading(true);
      
      const data = await apiClient<{ template: PlanTemplate }>('/api/plan-templates', {
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
      
      setTemplates((prev) =>
        prev.map((template) => (template.id === id ? data.template : template))
      );
      
      toast.success('Template updated successfully');
      
      return data.template;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      
      await apiClient(`/api/plan-templates?id=${id}`, {
        method: 'DELETE',
      });
      
      setTemplates((prev) => prev.filter((template) => template.id !== id));
      
      toast.success('Template deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
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