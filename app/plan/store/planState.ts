import { proxy } from "valtio"
import { TreeNode } from "../types"
import { createStep, createDocument } from "../utils"

// Create the state store with valtio
export const planState = proxy({
  currentStep: "identify-buyers",
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
        result: `## Lesson 1: Minimum Viable Company Brief (AnyQuest Example)

Instructor: Dan Wilson

### Who are you for?

Companies with $1M–$1B in revenue that have started using AI tools internally but need help scaling AI workflows across teams. Common buyers are in SaaS, logistics, professional services, or other mid-market to lower-enterprise orgs. Ideal personas include: CIOs, Heads of Ops, Innovation Leaders, AI Champions, and skeptical CFOs or IT stakeholders.

### What do you offer?

A no-code/low-code AI enablement platform that lets organizations build, deploy, and scale multi-step AI agents that integrate with their existing tools. It simplifies AI adoption by eliminating manual prompt work, enabling agent-to-agent workflows, and centralizing knowledge via retrieval-augmented generation.

### When do they need you?

When they’ve experimented with ChatGPT or AI tools, but workflows are manual, inconsistent, or siloed. Often under pressure from leadership to make AI more productive and want to reduce reliance on a few technical experts. Buying is triggered by internal pilots stalling, inconsistent output, or unmet AI scaling goals.

### How do you help?

*   Visual agent builder (multi-step workflows)
*   Integrations with Slack, email, and APIs
*   Retrieval-augmented generation (RAG) for internal knowledge reuse
*   Hosting, summarizing, and searching internal content
*   Cross-agent communication to maintain consistent outputs
*   Extend LLMs with tools like web search, scraping, etc.

### Why does it matter?

Customers want to move beyond AI experimentation into consistent, scalable, and secure automation. They want to empower teams (not just experts) to use AI, reduce manual effort, and speed up research, content generation, or internal processes — all while ensuring reliable, compliant, and cost-effective outcomes.

### Messaging Pillars

*   No-code AI workflows for operations, support, and product teams.
*   Go from idea to deployed AI workflow in under an hour.
*   Connect to your tools, databases, content, systems, and APIs.
*   Build Agents that understand your data, customers, and processes
*   Turn AI into a process you can trust and scale.
*   Build once, reuse everywhere

### Sample Use Cases

*   Account Research Bot – Pulls CRM + web data to generate sales briefs.
*   Competitive Intel Tracker – Monitors and summarizes competitor activity.
*   Compliance Checker – Reviews docs against policies or standards.
*   Contract Analyzer – Extracts key terms, risks, and dates from PDFs.
*   Customer Health Snapshot – Builds QBR decks from usage + notes.
*   Escalation Triage Agent – Routes and prioritizes support issues.
*   Internal AI Helpdesk – Answers employee questions using company docs.
*   Objection Handler – Surfaces rebuttals during live or recorded calls.
*   Onboarding Assistant – Guides new hires or customers through checklists.
*   Weekly Report Generator – Summarizes dashboards + emails into updates.

### Competitor Landscape

No-code/low-code AI agents for internal ops:

*   Reka
*   Kleon
*   Cognosys
*   MindStudio by YouAI`,
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
            result: "Something",
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