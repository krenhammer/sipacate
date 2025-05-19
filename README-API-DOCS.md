# Sipacate Auth API Documentation

This project includes API documentation generated using Swagger/OpenAPI standards. The documentation provides details about all available API endpoints, request/response formats, and authentication requirements.

## Accessing the API Documentation

The API documentation is available at the following URL when running the application:

```
http://localhost:3000/api-docs
```

This interactive documentation allows you to:
- Browse all available API endpoints
- See required parameters and request bodies
- View response formats
- Test API endpoints directly from the browser (authentication required for protected endpoints)

## Documentation Structure

The API documentation is organized into the following sections:

- **Admin APIs**: Endpoints that require administrator privileges
  - Email verification management
  - Organization management
  - User management
  
- **User APIs**: Endpoints available to authenticated users
  - API key management
  - Organization memberships
  - Invitations

## Authentication

Most API endpoints require authentication. The API supports two authentication methods:

1. **Bearer Authentication**: Using JWT tokens for user authentication
   ```
   Authorization: Bearer <your-jwt-token>
   ```

2. **API Key Authentication**: Using API keys for programmatic access
   ```
   X-API-Key: <your-api-key>
   ```

## Development

The API documentation is generated using Swagger/OpenAPI and swagger-jsdoc. To update the documentation:

1. Edit the YAML files in `app/api-docs/paths/` to add or modify endpoint documentation
2. Edit the component schemas in `app/api-docs/components/schemas.yaml`
3. Restart the server to see your changes

### Adding New API Documentation

When creating new API endpoints, add corresponding documentation by creating or updating YAML files in the appropriate directories:

- Add component schemas to `app/api-docs/components/schemas.yaml`
- Add path documentation to `app/api-docs/paths/[feature-name].yaml`

## Authentication Examples

### Using Bearer Token

```javascript
const response = await fetch('/api/organizations/memberships', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Using API Key

```javascript
const response = await fetch('/api/api-keys/verify', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key'
  }
});
``` 