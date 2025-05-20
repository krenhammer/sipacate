# AI Assitant (/assistant)
Need a way to crud AI Assistants which will be used to pass resuable context to each ai request

    - Drizzle migration for persistance to db
    - CRUD API (zod validation)

## Data

- name
- description
- instructions
- knowledge
- files[] (as markdown)

### Files

Will accept docx, md and images (with preview)
(convert docx to md using app/utils/docxToMarkdown.ts) 

check package.json before installing anything

DO NOT run `bun dev`
DO NOT restart server