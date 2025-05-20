In app/plan/plan.tsx build the ui as components using the attached image

- Sidebar
    - Logo
    - Ttile
    - Collapse Icon Button Toggle
    - Tabs
        Steps (react-arborist tree ... see below)
        History (thread list)
- Content Area
    - Markdown editor (marktion)
    - Modal Trigger Button
        - Chat Popup(non blocking)

Prefer
- Shadcn components
- radix ui components
- react-icons
- radix icons

Check package.json before installing use context7 mcp 
Do not run `bun dev`

Steps Tree (typed state object: valtio)
---------

- Ideal Customer Profile (ICP)
- Personas
    - Identify Buyers
    - One Pagers
    - Persona Generation
    - WebCopy
- Brand Voice
    - Persona & Product Analysis
    - Tone, Structure and Messaging
    - Prompt
    - AI Tell Tales
    - Update Brand Voice
    - Finalize Brand Voice Guidelines
- Assistant Context
    - Role and Purpose
    - Documents
        - Minimum Viable Product Brief
        - Persona Document
        - Customer Profiles
    - General Behavioral Rules
    - Tone & Style
    - Workflow & Behavior Rules
    - Optional logic
    - Things to Avoid
    - Examples of Good Interactions
- Campaign  
    - Campaign Strategy
    - Campain Brief
- Landing Pages 
    - Page Structure
    - Page Copy
    - Visual Layout
    - Versions
- Messaging 
    - Messaging Frameworks Analysis
    - Core Messaging
    - Word Positioning
- Email Outreach
    - First Response Email
    - Follow-up Email (No Reply)
    - Breakup Email Prompt (Final Touchpoint)
    - Email Sequence Summary In Batch
- Paid Ads & PPC Prompts
    - Google Search Ad Prompt
    - LinkedIn Sponsored Ad


Step type:
- name: string
- instructions: string (markdown)
- systemPrompt: string
- userPrompt: string
- result: string
