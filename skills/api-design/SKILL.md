---
name: api-design
description: Design RESTful APIs following OpenAPI 3.0 conventions with proper resource naming, versioning, and error handling
version: 1.0.0
category: backend
tags: ["api", "rest", "openapi", "design"]
---

# API Design

## When to Use
- Designing a new REST API or refactoring an existing one
- Creating OpenAPI/Swagger specifications
- Reviewing API consistency and naming conventions

## Procedure

### 1. Resource Naming
- Use nouns for resources: `/users`, `/orders`, `/products`
- Use plural nouns for collections: `/users` not `/user`
- Use hyphens for readability: `/user-preferences` not `/userPreferences`
- Nest sub-resources: `/users/{id}/orders`

### 2. HTTP Methods
| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

### 3. Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success with no body (DELETE)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### 4. Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      { "field": "email", "issue": "must be a valid email address" }
    ],
    "requestId": "req_abc123"
  }
}
```

### 5. Pagination
- Use cursor-based pagination for large datasets
- Include `next_cursor`, `has_more` in response
- Use `limit` parameter (with sensible default, e.g., 20)

## Pitfalls
- ⚠️ Don't use GET for state-changing operations (not idempotent-safe)
- ❌ Don't expose internal IDs (use UUIDs or hashed IDs)
- ⚠️ Version your API: `/v1/users` not `/users`
- ❌ Don't return arrays at the top level - always wrap in an object

## Verification
- [ ] All resources follow naming convention
- [ ] Correct HTTP methods for each operation
- [ ] Consistent error response format
- [ ] Pagination implemented for collections
- [ ] OpenAPI spec validates with `swagger-cli validate`
