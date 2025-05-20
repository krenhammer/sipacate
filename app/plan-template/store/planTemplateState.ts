import { proxy } from "valtio";
import { PlanTemplate } from "../types";

// Create the state store with valtio
export const planTemplateState = proxy({
  selectedTemplate: null as PlanTemplate | null,
  
  // Function to select a template
  selectTemplate: function(template: PlanTemplate) {
    this.selectedTemplate = template;
    console.log(`Template selected: ${template.title}`);
  }
}); 