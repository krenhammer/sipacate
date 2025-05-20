import * as yaml from 'js-yaml';
import { PlanTemplate, PlanStep, PlanItem, PlanStepItem } from '../plan-template/types';
import { Assistant, AssistantFile } from '../assistant/store';

// Utility types for simplified versions suitable for YAML export/import
export type ExportablePlanTemplate = Omit<PlanTemplate, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  steps: Array<Omit<PlanStep, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
    planStepItems: Array<Omit<PlanStepItem, 'createdAt' | 'updatedAt'> & {
      createdAt: string;
      updatedAt: string;
      planItem: Omit<PlanItem, 'createdAt' | 'updatedAt'> & {
        createdAt: string;
        updatedAt: string;
      };
    }>;
  }>;
};

export type ExportableAssistant = Omit<Assistant, 'createdAt' | 'updatedAt' | 'files'> & {
  createdAt: string;
  updatedAt: string;
  files: Array<Omit<AssistantFile, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  }>;
};

/**
 * Converts a Date object to an ISO string for YAML export
 */
const convertDatesToISO = (obj: any): any => {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Date) {
      result[key] = result[key].toISOString();
    } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = convertDatesToISO(result[key]);
    } else if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) => 
        typeof item === 'object' ? convertDatesToISO(item) : item
      );
    }
  }
  return result;
};

/**
 * Converts ISO string dates back to Date objects during import
 */
const convertISOToDates = (obj: any): any => {
  const result = { ...obj };
  for (const key in result) {
    if (key === 'createdAt' || key === 'updatedAt') {
      if (typeof result[key] === 'string') {
        result[key] = new Date(result[key]);
      }
    } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = convertISOToDates(result[key]);
    } else if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) => 
        typeof item === 'object' ? convertISOToDates(item) : item
      );
    }
  }
  return result;
};

/**
 * Exports a PlanTemplate to YAML
 */
export const exportPlanTemplateToYAML = (template: PlanTemplate): string => {
  const exportableTemplate = convertDatesToISO(template) as unknown as ExportablePlanTemplate;
  return yaml.dump(exportableTemplate);
};

/**
 * Imports a PlanTemplate from YAML
 */
export const importPlanTemplateFromYAML = (yamlString: string): PlanTemplate => {
  try {
    const importedTemplate = yaml.load(yamlString) as ExportablePlanTemplate;
    return convertISOToDates(importedTemplate) as unknown as PlanTemplate;
  } catch (error) {
    console.error('Failed to import template from YAML:', error);
    throw new Error('Invalid YAML format for plan template');
  }
};

/**
 * Exports an Assistant to YAML
 */
export const exportAssistantToYAML = (assistant: Assistant): string => {
  const exportableAssistant = convertDatesToISO(assistant) as unknown as ExportableAssistant;
  return yaml.dump(exportableAssistant);
};

/**
 * Imports an Assistant from YAML
 */
export const importAssistantFromYAML = (yamlString: string): Assistant => {
  try {
    const importedAssistant = yaml.load(yamlString) as ExportableAssistant;
    return convertISOToDates(importedAssistant) as unknown as Assistant;
  } catch (error) {
    console.error('Failed to import assistant from YAML:', error);
    throw new Error('Invalid YAML format for assistant');
  }
};

/**
 * Downloads a YAML file to the client
 */
export const downloadYAML = (yamlContent: string, filename: string): void => {
  const blob = new Blob([yamlContent], { type: 'application/yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Reads a YAML file from the client
 */
export const readYAMLFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}; 