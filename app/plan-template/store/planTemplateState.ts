import { proxy } from "valtio";
import { PlanTemplate } from "../types";

// Function to update URL when a template is selected
const updateUrl = (templateId: string | null) => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    
    if (templateId) {
      url.searchParams.set('selectedTemplate', templateId);
    } else {
      url.searchParams.delete('selectedTemplate');
    }
    
    window.history.replaceState({}, '', url.toString());
  }
};

// Create the state store with valtio
export const planTemplateState = proxy({
  selectedTemplate: null as PlanTemplate | null,
  
  // Function to select a template
  selectTemplate: function(template: PlanTemplate) {
    this.selectedTemplate = template;
    updateUrl(template.id);
    console.log(`Template selected: ${template.title}`);
  },
  
  // Function to clear selected template
  clearSelectedTemplate: function() {
    this.selectedTemplate = null;
    updateUrl(null);
  }
});

// Initialize from URL if available
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get('selectedTemplate');
  
  if (selectedId) {
    // We'll need to load the template data based on this ID
    // This will typically happen in the component that uses this store
    console.log(`Template ID from URL: ${selectedId}`);
  }
} 