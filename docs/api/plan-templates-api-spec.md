# Plan Templates API Specification

## Overview

The Plan Templates API enables the management of structured planning templates for users and organizations. These templates consist of steps, which in turn contain items. The API allows for CRUD operations on templates, steps, and items, as well as reordering operations.

## Data Models

### PlanTemplate

```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "createdById": "string",
  "organizationId": "string | null",
  "createdAt": "ISO8601 DateTime",
  "updatedAt": "ISO8601 DateTime",
  "steps": "PlanStep[] | undefined"
}
```

### PlanStep

```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "planTemplateId": "string",
  "createdById": "string",
  "organizationId": "string | null",
  "order": "number | undefined",
  "createdAt": "ISO8601 DateTime",
  "updatedAt": "ISO8601 DateTime",
  "planStepItems": "PlanStepItem[] | undefined"
}
```

### PlanItem

```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "type": "List | Document",
  "instructions": "string | null",
  "systemPrompt": "string | null",
  "userPrompt": "string | null",
  "createdById": "string",
  "organizationId": "string | null",
  "createdAt": "ISO8601 DateTime",
  "updatedAt": "ISO8601 DateTime"
}
```

### PlanStepItem (Junction)

```json
{
  "id": "string",
  "planStepId": "string",
  "planItemId": "string",
  "order": "number",
  "createdAt": "ISO8601 DateTime",
  "updatedAt": "ISO8601 DateTime",
  "planItem": "PlanItem | undefined"
}
```

## Authentication

All API endpoints require authentication. The API uses session-based authentication. Include an appropriate session token in the request headers. If not authenticated, endpoints will return a 401 Unauthorized status code.

## API Endpoints

### Plan Templates

#### GET /api/plan-templates

Retrieves all plan templates for the authenticated user or their active organization.

**Response:**
- `200 OK`: Successfully retrieved templates
  ```json
  {
    "templates": [PlanTemplate]
  }
  ```
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### POST /api/plan-templates

Creates a new plan template.

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "organizationId": "string (optional)"
}
```

**Response:**
- `201 Created`: Successfully created template
  ```json
  {
    "template": PlanTemplate
  }
  ```
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### PUT /api/plan-templates

Updates an existing plan template.

**Request Body:**
```json
{
  "id": "string",
  "title": "string (optional)",
  "description": "string (optional)"
}
```

**Response:**
- `200 OK`: Successfully updated template
  ```json
  {
    "template": PlanTemplate
  }
  ```
- `400 Bad Request`: Invalid request body or missing ID
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to template
- `404 Not Found`: Template not found
- `500 Internal Server Error`: Server error

#### DELETE /api/plan-templates

Deletes a plan template.

**Request Body:**
```json
{
  "id": "string"
}
```

**Response:**
- `200 OK`: Successfully deleted template
  ```json
  {
    "success": true
  }
  ```
- `400 Bad Request`: Missing ID
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to template
- `404 Not Found`: Template not found
- `500 Internal Server Error`: Server error

### Plan Steps

#### GET /api/plan-templates/[id]/steps

Retrieves all steps for a specific plan template.

**URL Parameters:**
- `id`: Plan template ID

**Response:**
- `200 OK`: Successfully retrieved steps
  ```json
  {
    "steps": [PlanStep]
  }
  ```
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to template
- `404 Not Found`: Template not found
- `500 Internal Server Error`: Server error

#### POST /api/plan-templates/[id]/steps

Creates a new step in a plan template.

**URL Parameters:**
- `id`: Plan template ID

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)"
}
```

**Response:**
- `201 Created`: Successfully created step
  ```json
  {
    "step": PlanStep
  }
  ```
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to template
- `404 Not Found`: Template not found
- `500 Internal Server Error`: Server error

#### PUT /api/plan-templates/[id]/steps

Updates an existing step in a plan template.

**URL Parameters:**
- `id`: Plan template ID

**Request Body:**
```json
{
  "id": "string",
  "title": "string (optional)",
  "description": "string (optional)"
}
```

**Response:**
- `200 OK`: Successfully updated step
  ```json
  {
    "step": PlanStep
  }
  ```
- `400 Bad Request`: Invalid request body or missing ID
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to step
- `404 Not Found`: Step not found
- `500 Internal Server Error`: Server error

#### DELETE /api/plan-templates/[id]/steps

Deletes a step from a plan template.

**URL Parameters:**
- `id`: Plan template ID

**Request Body:**
```json
{
  "id": "string"
}
```

**Response:**
- `200 OK`: Successfully deleted step
  ```json
  {
    "success": true
  }
  ```
- `400 Bad Request`: Missing ID
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to step
- `404 Not Found`: Step not found
- `500 Internal Server Error`: Server error

#### POST /api/plan-templates/[id]/steps/reorder

Reorders steps within a plan template.

**URL Parameters:**
- `id`: Plan template ID

**Request Body:**
```json
{
  "steps": [
    {
      "id": "string",
      "order": "number"
    }
  ]
}
```

**Response:**
- `200 OK`: Successfully reordered steps
  ```json
  {
    "success": true
  }
  ```
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to template
- `404 Not Found`: Template not found
- `500 Internal Server Error`: Server error

### Plan Step Items

#### POST /api/plan-templates/[id]/steps/[stepId]/reorder

Reorders items within a step.

**URL Parameters:**
- `id`: Plan template ID
- `stepId`: Plan step ID

**Request Body:**
```json
{
  "items": [
    {
      "id": "string",
      "order": "number"
    }
  ]
}
```

**Response:**
- `200 OK`: Successfully reordered items
  ```json
  {
    "success": true
  }
  ```
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to step
- `404 Not Found`: Step not found
- `500 Internal Server Error`: Server error

### Plan Items

#### GET /api/plan-items

Retrieves all plan items for the authenticated user or their active organization.

**Response:**
- `200 OK`: Successfully retrieved items
  ```json
  {
    "items": [PlanItem]
  }
  ```
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

#### POST /api/plan-items

Creates a new plan item, optionally adding it to a step.

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "type": "List | Document",
  "instructions": "string (optional)",
  "systemPrompt": "string (optional)",
  "userPrompt": "string (optional)",
  "planStepId": "string (optional)",
  "order": "number (optional)",
  "organizationId": "string (optional)"
}
```

**Response:**
- `201 Created`: Successfully created item
  ```json
  {
    "item": PlanItem
  }
  ```
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to step
- `404 Not Found`: Step not found
- `500 Internal Server Error`: Server error

#### PUT /api/plan-items

Updates an existing plan item.

**Request Body:**
```json
{
  "id": "string",
  "title": "string (optional)",
  "description": "string (optional)",
  "type": "List | Document (optional)",
  "instructions": "string (optional)",
  "systemPrompt": "string (optional)",
  "userPrompt": "string (optional)"
}
```

**Response:**
- `200 OK`: Successfully updated item
  ```json
  {
    "item": PlanItem
  }
  ```
- `400 Bad Request`: Invalid request body or missing ID
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to item
- `404 Not Found`: Item not found
- `500 Internal Server Error`: Server error

#### DELETE /api/plan-items

Deletes a plan item.

**Request Body:**
```json
{
  "id": "string"
}
```

**Response:**
- `200 OK`: Successfully deleted item
  ```json
  {
    "success": true
  }
  ```
- `400 Bad Request`: Missing ID
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to item
- `404 Not Found`: Item not found
- `500 Internal Server Error`: Server error

#### PATCH /api/plan-items

Adds an existing plan item to a step.

**Request Body:**
```json
{
  "planItemId": "string",
  "planStepId": "string",
  "order": "number (optional)"
}
```

**Response:**
- `200 OK`: Successfully added item to step
  ```json
  {
    "success": true
  }
  ```
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Unauthorized access to step
- `404 Not Found`: Step or item not found
- `500 Internal Server Error`: Server error

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

Common HTTP status codes:
- `200 OK`: Request succeeded
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Implementation Notes

1. Access Control:
   - Items belonging to a user are accessible only to that user
   - Items belonging to an organization are accessible to members of that organization
   - Authorization checks are performed at each endpoint

2. Data Relationships:
   - A template can have multiple steps
   - A step belongs to a single template
   - A step can have multiple items
   - An item can belong to multiple steps through the junction table
   - The order of items within a step is maintained by the `order` field

3. ID Generation:
   - All resources use a string ID format
   - IDs are generated on the server using a secure ID generation method

4. Timestamps:
   - All resources include `createdAt` and `updatedAt` timestamps
   - Timestamps are in ISO8601 format 