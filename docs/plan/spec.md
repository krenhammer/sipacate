# Plans (/plans)
Need a way to crud Plans which will be used to aggregate plan template, and assistant 

Use flowchildren icon in components/header.tsx for link  

## Data
- id
- name
- description
- planTemplateid
- assistantId
- organization (nullable)
- createdBy
- created
- updated

## UI

- Add icon Button
- Trash icon Button (with confirmation)

- name
- description
- https://ui.shadcn.com/docs/components/combobox
    - Plan Templates (default first)
    - Assistants (default first))
- Save button (validation)

Prefer 
- shadcn components
- radix components
- react-icons
- lucide icons

check package.json before installing anything

DO NOT run `bun dev`
DO NOT restart server