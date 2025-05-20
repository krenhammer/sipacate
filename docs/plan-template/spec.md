# Plan Template (/plan-template)

Create a way for Users to CRUD plan Tempates which consit of plan steps each with plan item children

    - Drizzle migration for persistance to db
    - CRUD API (zod validation)

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
- organization?

## UI

Ability to CRUD Plan Templates

- https://ui.shadcn.com/docs/components/combobox with all users/organizations Plan Templates to edit
- Add Icon Button

### Plan Template Drag and drop reorderable List (debounce save on changes)

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

        check package.json before installing anything

DO NOT run `bun dev`
DO NOT restart server