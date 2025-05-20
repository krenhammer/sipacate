# Plan Templates (/plan-template)

Create a way for Users to CRUD Plan Templates which consist of plan steps each with plan item children

    - Drizzle migration for persistance to db
    - CRUD API (zod validation)

Use circular ghost list icon in components/header.tsx for link with tooltip 

## Types

### PlanItemType
- List
- Document

### PlanStep
- id
- title
- description
- children [] (ids -> order determined by dnd below (intermediate table))
- createdBy
- organization?

### PlanItem 

- id
- title
- description
- type
- instructions
- systemPrompt
- userPrompt
- created
- updated
- organization (nullable)

## UI

Ability to CRUD Plan Templates

- https://ui.shadcn.com/docs/components/combobox with all users/organizations Plan Templates to edit (default first)
- Add icon Button
- Trash icon Button (with confirmation)

### Plan Template 
Drag and drop reorderable List (Save button)

- PlanSteps 
    - Collapsible sections
        - Title / Description
        - children (PlanItems)

- PlanItems 
    - Edit
    - Delete (confirmation)
    - Collapsible section
        - instructions
        - userPrompt
        - systemPrompt 

Prefer 
- shadcn components
- radix components
- react-icons
- lucide icons

check package.json before installing anything

DO NOT run `bun dev`
DO NOT restart server