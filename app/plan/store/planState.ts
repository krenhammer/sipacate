import { proxy } from "valtio"
import { TreeNode } from "../types"
import { createStep, createDocument } from "../utils"

// Create the state store with valtio
export const planState = proxy({
  steps: [
    {
      id: "icp",
      name: "Ideal Customer Profile (ICP)",
      type: "step" as const,
      data: {
        id: "icp",
        name: "Ideal Customer Profile (ICP)",
        instructions: "# Create an Ideal Customer Profile\n\nDefine your target audience demographics, pain points, and goals.",
        systemPrompt: "You are an expert marketing consultant.",
        userPrompt: "Help me create an Ideal Customer Profile for my business.",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "personas",
      name: "Personas",
      children: [
        {
          id: "identify-buyers",
          name: "Identify Buyers",
          type: "step" as const,
          data: {
            id: "identify-buyers",
            name: "Identify Buyers",
            instructions: "# Identify Your Buyers\n\nList the key decision makers and influencers.",
            systemPrompt: "You are a B2B sales expert.",
            userPrompt: "Help me identify the key decision makers for my product.",
            result: "",
            created: Date.now(),
            updated: Date.now()
          }
        },
        {
          id: "one-pagers",
          name: "One Pagers",
          type: "step" as const,
          data: {
            id: "one-pagers",
            name: "One Pagers",
            instructions: "# Create One-Pager Documents\n\nCreate concise one-page summaries for each persona.",
            systemPrompt: "You are a marketing content specialist.",
            userPrompt: "Help me create effective one-pagers for my target personas.",
            result: "",
            created: Date.now(),
            updated: Date.now()
          }
        },
        createStep("persona-generation", "Persona Generation"),
        createStep("webcopy", "WebCopy")
      ],
      type: "step" as const,
      data: {
        id: "personas",
        name: "Personas",
        instructions: "# Define Your Buyer Personas\n\nCreate detailed profiles of your ideal customers.",
        systemPrompt: "You are a customer research specialist.",
        userPrompt: "Help me create detailed buyer personas for my business.",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "brand-voice",
      name: "Brand Voice",
      children: [
        createStep("persona-product-analysis", "Persona & Product Analysis"),
        createStep("tone-structure-messaging", "Tone, Structure and Messaging"),
        createStep("prompt", "Prompt"),
        createStep("ai-tell-tales", "AI Tell Tales"),
        createStep("update-brand-voice", "Update Brand Voice"),
        createStep("finalize-brand-voice", "Finalize Brand Voice Guidelines")
      ],
      type: "step" as const,
      data: {
        id: "brand-voice",
        name: "Brand Voice",
        instructions: "# Define Your Brand Voice\n\nCreate a consistent tone and messaging style for your brand.",
        systemPrompt: "",
        userPrompt: "",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "assistant-context",
      name: "Assistant Context",
      children: [
        createStep("role-purpose", "Role and Purpose"),
        {
          id: "documents",
          name: "Documents",
          children: [
            createDocument("mvp-brief", "Minimum Viable Product Brief"),
            createDocument("persona-document", "Persona Document"),
            createDocument("customer-profiles", "Customer Profiles")
          ],
          type: "step" as const,
          data: {
            id: "documents",
            name: "Documents",
            instructions: "# Manage Documents\n\nOrganize and manage key documents for your assistant.",
            systemPrompt: "",
            userPrompt: "",
            result: "",
            created: Date.now(),
            updated: Date.now()
          }
        },
        createStep("general-behavioral-rules", "General Behavioral Rules"),
        createStep("tone-style", "Tone & Style"),
        createStep("workflow-behavior-rules", "Workflow & Behavior Rules"),
        createStep("optional-logic", "Optional logic"),
        createStep("things-to-avoid", "Things to Avoid"),
        createStep("good-interactions", "Examples of Good Interactions")
      ],
      type: "step" as const,
      data: {
        id: "assistant-context",
        name: "Assistant Context",
        instructions: "# Define Assistant Context\n\nSpecify how your AI assistant should behave and respond.",
        systemPrompt: "",
        userPrompt: "",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "campaign",
      name: "Campaign",
      children: [
        createStep("campaign-strategy", "Campaign Strategy"),
        createStep("campaign-brief", "Campaign Brief")
      ],
      type: "step" as const,
      data: {
        id: "campaign",
        name: "Campaign",
        instructions: "# Plan Your Campaign\n\nDevelop a comprehensive marketing campaign strategy.",
        systemPrompt: "",
        userPrompt: "",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "landing-pages",
      name: "Landing Pages",
      children: [
        createStep("page-structure", "Page Structure"),
        createStep("page-copy", "Page Copy"),
        createStep("visual-layout", "Visual Layout"),
        createStep("versions", "Versions")
      ],
      type: "step" as const,
      data: {
        id: "landing-pages",
        name: "Landing Pages",
        instructions: "# Design Landing Pages\n\nCreate effective landing pages for your campaigns.",
        systemPrompt: "",
        userPrompt: "",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "messaging",
      name: "Messaging",
      children: [
        createStep("messaging-frameworks", "Messaging Frameworks Analysis"),
        createStep("core-messaging", "Core Messaging"),
        createStep("word-positioning", "Word Positioning")
      ],
      type: "step" as const,
      data: {
        id: "messaging",
        name: "Messaging",
        instructions: "# Develop Messaging\n\nCreate consistent messaging across all channels.",
        systemPrompt: "",
        userPrompt: "",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "email-outreach",
      name: "Email Outreach",
      children: [
        createStep("first-response", "First Response Email"),
        createStep("follow-up", "Follow-up Email (No Reply)"),
        createStep("breakup-email", "Breakup Email Prompt (Final Touchpoint)"),
        createStep("email-sequence", "Email Sequence Summary In Batch")
      ],
      type: "step" as const,
      data: {
        id: "email-outreach",
        name: "Email Outreach",
        instructions: "# Create Email Campaigns\n\nDevelop email sequences for outreach and follow-up.",
        systemPrompt: "",
        userPrompt: "",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    },
    {
      id: "paid-ads",
      name: "Paid Ads & PPC Prompts",
      children: [
        createStep("google-search-ad", "Google Search Ad Prompt"),
        createStep("linkedin-sponsored", "LinkedIn Sponsored Ad")
      ],
      type: "step" as const,
      data: {
        id: "paid-ads",
        name: "Paid Ads & PPC Prompts",
        instructions: "# Design Paid Ad Campaigns\n\nCreate effective ad copy for various platforms.",
        systemPrompt: "",
        userPrompt: "",
        result: "",
        created: Date.now(),
        updated: Date.now()
      }
    }
  ] as TreeNode[],
  selectedNode: null as TreeNode | null,
  sidebarCollapsed: false
}) 