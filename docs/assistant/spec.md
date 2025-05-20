# AI Assistant (/assistant)
Need a way to crud AI Assistants which will be used to pass resuable context to each ai request

    - Drizzle migration for persistance to db
    - CRUD API (zod validation)

Use robot icon in components/header.tsx for link  

## Data
- id
- name
- description
- instructions
- knowledge
- files[] (as markdown - intermediate table)
- organization (nullable)
- createdBy
- created
- updated

### Files

Will accept docx, md and images (with preview)
(convert docx to md using app/utils/docxToMarkdown.ts) 

Prefer 
- shadcn components
- radix components
- react-icons
- lucide icons

check package.json before installing anything

DO NOT run `bun dev`
DO NOT restart server