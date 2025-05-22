# Plan Items API Specification

## Overview

The Plan Items API provides endpoints for managing plan items, which are individual components that can be used within plan steps. Plan items can be of different types (such as Lists or Documents) and can contain various forms of content, including instructions, system prompts, and user prompts.

## Data Models

### Plan Item

A Plan Item represents a discrete piece of content within a plan.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the plan item |
| title | string | Title of the plan item |
| description | string (optional) | Description of the plan item |
| type | enum ("List", "Document") | Type of plan item |
| instructions | string (optional) | Instructions for using the plan item |
| systemPrompt | string (optional) | System prompt for AI processing |
| userPrompt | string (optional) | User prompt for AI processing |
| createdById | string | ID of the user who created the item |
| organizationId | string (optional) | ID of the organization the item belongs to |
| createdAt | datetime | When the item was created |
| updatedAt | datetime | When the item was last updated |

### Plan Step Item Relationship

Represents the relationship between a Plan Item and a Plan Step.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the relationship |
| planStepId | string | ID of the plan step |
| planItemId | string | ID of the plan item |
| order | number | Order of the item within the step |
| createdAt | datetime | When the relationship was created |

## Endpoints

### Get All Plan Items

Retrieves all plan items for the current user or organization.

**Request:**
```
GET /api/plan-items
```

**Authentication:**
- Required

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "List|Document",
      "instructions": "string",
      "systemPrompt": "string",
      "userPrompt": "string",
      "createdById": "string",
      "organizationId": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Successfully retrieved plan items
- `401 Unauthorized`: User is not authenticated
- `500 Internal Server Error`: Server error occurred

### Create Plan Item

Creates a new plan item.

**Request:**
```
POST /api/plan-items
```

**Authentication:**
- Required

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "type": "List|Document",
  "instructions": "string (optional)",
  "systemPrompt": "string (optional)",
  "userPrompt": "string (optional)",
  "planStepId": "string (optional)",
  "order": "number (optional)",
  "organizationId": "string (optional)"
}
```

**Response:**
```json
{
  "item": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "List|Document",
    "instructions": "string",
    "systemPrompt": "string",
    "userPrompt": "string",
    "createdById": "string",
    "organizationId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Status Codes:**
- `201 Created`: Successfully created plan item
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: User is not authenticated
- `403 Forbidden`: User does not have permission
- `404 Not Found`: Referenced plan step not found
- `500 Internal Server Error`: Server error occurred

### Update Plan Item

Updates an existing plan item.

**Request:**
```
PUT /api/plan-items
```

**Authentication:**
- Required

**Request Body:**
```json
{
  "id": "string",
  "title": "string (optional)",
  "description": "string (optional)",
  "type": "List|Document (optional)",
  "instructions": "string (optional)",
  "systemPrompt": "string (optional)",
  "userPrompt": "string (optional)"
}
```

**Response:**
```json
{
  "item": {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "List|Document",
    "instructions": "string",
    "systemPrompt": "string",
    "userPrompt": "string",
    "createdById": "string",
    "organizationId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Status Codes:**
- `200 OK`: Successfully updated plan item
- `400 Bad Request`: Invalid request body or missing item ID
- `401 Unauthorized`: User is not authenticated
- `403 Forbidden`: User does not have permission to update the item
- `404 Not Found`: Plan item not found
- `500 Internal Server Error`: Server error occurred

### Delete Plan Item

Deletes a plan item.

**Request:**
```
DELETE /api/plan-items?id=string
```

**Authentication:**
- Required

**Query Parameters:**
- `id`: ID of the plan item to delete

**Response:**
- No content on success

**Status Codes:**
- `204 No Content`: Successfully deleted plan item
- `400 Bad Request`: Missing item ID
- `401 Unauthorized`: User is not authenticated
- `403 Forbidden`: User does not have permission to delete the item
- `404 Not Found`: Plan item not found
- `500 Internal Server Error`: Server error occurred

### Add Item to Step

Adds a plan item to a plan step or updates its position within a step.

**Request:**
```
PATCH /api/plan-items
```

**Authentication:**
- Required

**Request Body:**
```json
{
  "planItemId": "string",
  "planStepId": "string",
  "order": "number (optional)"
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK`: Successfully added item to step
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: User is not authenticated
- `403 Forbidden`: User does not have permission
- `404 Not Found`: Plan item or step not found
- `500 Internal Server Error`: Server error occurred

## Authorization

- Users can only access and modify plan items they have created, unless they are part of an organization that owns the item
- Organization administrators can manage all plan items within their organization
- All endpoints require authentication

## Error Handling

All endpoints return standard error responses with the following structure:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. Excessive requests may result in temporary blocks.

## Versioning

This API specification represents the current version of the Plan Items API. Future updates will be documented with appropriate version information. 