export type PlanItemType = "List" | "Document";

export interface PlanTemplate {
  id: string;
  title: string;
  description: string | null;
  createdById: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  steps?: PlanStep[];
}

export interface PlanStep {
  id: string;
  title: string;
  description: string | null;
  planTemplateId: string;
  createdById: string;
  organizationId: string | null;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  planStepItems?: PlanStepItem[];
}

export interface PlanItem {
  id: string;
  title: string;
  description: string | null;
  type: PlanItemType;
  instructions: string | null;
  systemPrompt: string | null;
  userPrompt: string | null;
  createdById: string;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanStepItem {
  id: string;
  planStepId: string;
  planItemId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  planItem?: PlanItem;
} 