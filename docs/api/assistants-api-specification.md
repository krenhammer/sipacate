# Assistants API Specification

## Overview

The Assistants API provides a way to create, retrieve, update, and delete AI assistants within the system. Each assistant represents a configurable AI entity with customizable attributes and knowledge files. The API supports operations at both individual and organizational levels, allowing for shared assistants within organizations.

## Data Models

### Assistant

An assistant represents a configurable AI entity with the following attributes:

- `id`: Unique identifier for the assistant (string, automatically generated)
- `name`: Name of the assistant (string, required)
- `description`: Description of the assistant (string, optional)
- `instructions`: Custom instructions for the assistant's behavior (string, optional)
- `knowledge`: Background knowledge or context for the assistant (string, optional)
- `organizationId`: ID of the organization that owns the assistant (string, optional)
- `createdById`: ID of the user who created the assistant (string, set by server)
- `createdAt`: Timestamp when the assistant was created (date, set by server)
- `updatedAt`: Timestamp when the assistant was last updated (date, set by server)

### Assistant File

Files attached to an assistant that provide additional context or knowledge:

- `id`: Unique identifier for the file (string, automatically generated)
- `assistantId`: ID of the assistant this file belongs to (string)
- `filename`: Name of the file (string)
- `content`: File content as string (string)
- `fileType`: Type of file (enum: "md", "docx", "image", "pdf", "txt")
- `size`: Size of the file in bytes (number)
- `createdAt`: Timestamp when the file was created (date, set by server)
- `updatedAt`: Timestamp when the file was last updated (date, set by server)

## Authentication

All endpoints require authentication. Requests must include appropriate authentication credentials (session tokens or API keys). The API verifies user identity and their association with the requested resources.

## Authorization

- Users can access assistants they created
- Users can access assistants owned by organizations they are members of
- Administrative operations require appropriate permissions

## API Endpoints

### 1. List Assistants

Retrieves a list of assistants accessible to the authenticated user.

- **URL**: `/api/assistants`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: None
- **Response**:
  - Status: 200 OK
  - Body:
    ```json
    {
      "data": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "instructions": "string",
          "knowledge": "string",
          "organizationId": "string",
          "createdById": "string",
          "createdAt": "timestamp",
          "updatedAt": "timestamp",
          "files": [
            {
              "id": "string",
              "assistantId": "string",
              "filename": "string",
              "content": "string",
              "fileType": "string",
              "createdAt": "timestamp",
              "updatedAt": "timestamp"
            }
          ]
        }
      ]
    }
    ```
  - Error Responses:
    - 401 Unauthorized: User is not authenticated
    - 500 Internal Server Error: Server error occurred

### 2. Get Assistant by ID

Retrieves a specific assistant by its ID.

- **URL**: `/api/assistants/[id]`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id`: ID of the assistant to retrieve
- **Response**:
  - Status: 200 OK
  - Body:
    ```json
    {
      "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "instructions": "string",
        "knowledge": "string",
        "organizationId": "string",
        "createdById": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "files": [
          {
            "id": "string",
            "assistantId": "string",
            "filename": "string",
            "content": "string",
            "fileType": "string",
            "createdAt": "timestamp",
            "updatedAt": "timestamp"
          }
        ]
      }
    }
    ```
  - Error Responses:
    - 401 Unauthorized: User is not authenticated
    - 403 Forbidden: User is not authorized to access this assistant
    - 404 Not Found: Assistant with the given ID does not exist
    - 500 Internal Server Error: Server error occurred

### 3. Create Assistant

Creates a new assistant.

- **URL**: `/api/assistants`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "instructions": "string",
    "knowledge": "string",
    "files": [
      {
        "filename": "string",
        "content": "string",
        "fileType": "string",
        "size": "number"
      }
    ]
  }
  ```
- **Response**:
  - Status: 201 Created
  - Body:
    ```json
    {
      "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "instructions": "string",
        "knowledge": "string",
        "organizationId": "string",
        "createdById": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "files": [
          {
            "id": "string",
            "assistantId": "string",
            "filename": "string",
            "content": "string",
            "fileType": "string",
            "createdAt": "timestamp",
            "updatedAt": "timestamp"
          }
        ]
      }
    }
    ```
  - Error Responses:
    - 400 Bad Request: Invalid request body
    - 401 Unauthorized: User is not authenticated
    - 500 Internal Server Error: Server error occurred

### 4. Update Assistant

Updates an existing assistant.

- **URL**: `/api/assistants`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "instructions": "string",
    "knowledge": "string",
    "files": [
      {
        "filename": "string",
        "content": "string",
        "fileType": "string",
        "size": "number"
      }
    ]
  }
  ```
- **Response**:
  - Status: 200 OK
  - Body:
    ```json
    {
      "data": {
        "id": "string",
        "name": "string",
        "description": "string",
        "instructions": "string",
        "knowledge": "string",
        "organizationId": "string",
        "createdById": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "files": [
          {
            "id": "string",
            "assistantId": "string",
            "filename": "string",
            "content": "string",
            "fileType": "string",
            "createdAt": "timestamp",
            "updatedAt": "timestamp"
          }
        ]
      }
    }
    ```
  - Error Responses:
    - 400 Bad Request: Invalid request body
    - 401 Unauthorized: User is not authenticated
    - 403 Forbidden: User is not authorized to update this assistant
    - 404 Not Found: Assistant with the given ID does not exist
    - 500 Internal Server Error: Server error occurred

### 5. Delete Assistant

Deletes an existing assistant.

- **URL**: `/api/assistants`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Query Parameters**:
  - `id`: ID of the assistant to delete
- **Response**:
  - Status: 200 OK
  - Body:
    ```json
    {
      "data": {
        "id": "string",
        "deleted": true
      }
    }
    ```
  - Error Responses:
    - 400 Bad Request: Missing assistant ID
    - 401 Unauthorized: User is not authenticated
    - 403 Forbidden: User is not authorized to delete this assistant
    - 404 Not Found: Assistant with the given ID does not exist
    - 500 Internal Server Error: Server error occurred

## Validation Rules

1. Assistant name is required and must be at least 1 character long
2. File types must be one of: "md", "docx", "image", "pdf", "txt"
3. When updating an assistant:
   - Assistant ID is required
   - Files array will replace all existing files (if provided)

## Additional Notes

1. **ID Generation**: All IDs are generated using a CUID2 algorithm to ensure uniqueness
2. **File Management**: When updating an assistant with files, all existing files are deleted and replaced with the new files
3. **Organization Context**: Assistants can be associated with an organization, making them accessible to all members of that organization
4. **Cascading Deletes**: When an assistant is deleted, all associated files are automatically deleted
5. **Response Format**: All responses follow a consistent format with a `data` property for successful operations or an `error` property for failures
6. **Timestamps**: All timestamp fields are managed by the server and returned in ISO format 