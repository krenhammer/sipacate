# Assistant YAML Import Guide

This guide explains how to create and import AI assistants using the YAML format.

## Sample Assistant

A sample assistant YAML file is provided in `docs/assistant/sample-assistant.yaml`. This file includes:

- A research assistant with instructions and knowledge base
- Three markdown documents containing research-related content
- Complete metadata required for importing

## YAML Structure

The assistant YAML file should follow this structure:

```yaml
id: unique-assistant-id
name: Assistant Name
description: A brief description of the assistant's purpose
instructions: >
  Detailed instructions for how the assistant should behave,
  respond, and what rules it should follow
knowledge: >
  Domain-specific knowledge that the assistant needs to reference
organizationId: null  # or your organization ID
createdById: user-id
createdAt: "2023-10-15T12:00:00.000Z"
updatedAt: "2023-10-15T12:00:00.000Z"
files:
  - id: file-id-1
    assistantId: unique-assistant-id
    content: |
      # Markdown content
      Detailed content for this file...
    filename: filename.md
    fileType: markdown
    createdAt: "2023-10-15T12:00:00.000Z"
    updatedAt: "2023-10-15T12:00:00.000Z"
  # Add more files as needed
```

## How to Import

1. From the Assistants page, click the "Import Assistant" button
2. Select your YAML file in the file dialog
3. Click "Import"
4. The assistant will be created with all the specified properties and files

## Creating Your Own YAML Files

You can either:

1. Export an existing assistant using the export button (download icon) next to the assistant
2. Modify the sample YAML file to create your own assistant
3. Write a new YAML file from scratch following the structure above

### Notes on File Content

- Markdown files should be well-formatted with proper headers
- Use the YAML pipe character `|` followed by indented markdown content
- Each file needs a unique ID
- The `fileType` should be set to `markdown` for markdown files

## Troubleshooting

If you encounter issues importing your YAML file:

- Ensure your YAML syntax is valid (no tab characters, proper indentation)
- Check that all required fields are included
- Verify that IDs are unique
- Ensure dates are in proper ISO format 