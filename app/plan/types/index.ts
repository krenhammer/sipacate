// Define Step and Document types
export interface Step {
  id: string
  name: string
  instructions: string
  systemPrompt: string
  userPrompt: string
  result: string
  created: number
  updated: number
}

export interface Document {
  id: string
  name: string
  content: string
  created: number
  updated: number
}

export type TreeNode = {
  id: string
  name: string
  children?: TreeNode[]
  type: 'step' | 'document'
  data: Step | Document
} 