import { z } from "zod";

// Base validation schema for Assistant
export const assistantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  knowledge: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
  createdById: z.string().optional(), // Will be set by the server
});

// Type for Assistant form data
export type AssistantFormData = z.infer<typeof assistantSchema>;

// Validation schema for file uploads
export const fileSchema = z.object({
  filename: z.string(),
  content: z.string(),
  fileType: z.enum(["md", "docx", "image", "pdf", "txt"]),
  size: z.number(),
});

// Type for file upload
export type FileUpload = z.infer<typeof fileSchema>;

// Validation schema for creating a new assistant
export const createAssistantSchema = assistantSchema.extend({
  files: z.array(fileSchema).optional(),
});

// Validation schema for updating an assistant
export const updateAssistantSchema = assistantSchema.extend({
  id: z.string(),
  files: z.array(fileSchema).optional(),
});

// Type for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
} 