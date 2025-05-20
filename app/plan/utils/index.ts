import { TreeNode } from "../types"

// Utility function to create a Step
export const createStep = (id: string, name: string): TreeNode => ({
  id,
  name,
  type: 'step',
  data: {
    id,
    name,
    instructions: `# ${name}\n\nAdd your instructions here.`,
    systemPrompt: "",
    userPrompt: "",
    result: "",
    created: Date.now(),
    updated: Date.now()
  }
})

// Utility function to create a Document
export const createDocument = (id: string, name: string): TreeNode => ({
  id,
  name,
  type: 'document',
  data: {
    id,
    name,
    content: `# ${name}\n\nAdd your content here.`,
    created: Date.now(),
    updated: Date.now()
  }
}) 