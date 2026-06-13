---
name: api-design
description: >
  Design RESTful APIs, create OpenAPI 3.x specifications, define resource endpoints,
  set up pagination and filtering, version your API, handle error responses consistently,
  or need best practices for HTTP methods, status codes, and URL structure. Use this skill
  when the user is designing a new API, reviewing an existing one for consistency, writing
  an OpenAPI/Swagger spec, or needs guidance on REST conventions and API best practices.
  Don't hesitate to suggest this skill when the user is working on API design, endpoint
  naming, API versioning, or error response formats, even if they don't explicitly mention
  REST or OpenAPI.
version: 1.0.0
category: backend
tags: [api, rest, openapi, design, http, swagger]
---

# API Design

## When to Use

Use this skill when the user asks about any of the following:

1. **Designing a new REST API** — defining resource endpoints, URL structure, and HTTP method usage
2. **Creating or reviewing an OpenAPI/Swagger specification** — writing YAML/JSON specs, validating schemas
3. **API versioning strategy** — deciding between URL path versioning (`/v1/`), header versioning, or content negotiation
4. **Error response design** — defining a consistent error envelope with codes, messages, and field-level details
5. **Pagination and filtering** — cursor-based vs. offset pagination, query parameter conventions, sorting
6. **API naming conventions** — resource naming, hyphenation, nesting sub-resources, pluralization rules
7. **HTTP method semantics** — choosing between GET/POST/PUT/PATCH/DELETE correctly, understanding idempotency and safety
8. **Status code selection** — picking the right 2xx/4xx/5xx code for a given scenario
9. **Reviewing an existing API** — checking for REST conformance, consistency, and best-practice adherence
10. **Setting up API documentation** — generating docs from OpenAPI specs, integrating with Swagger UI or Redoc

## When NOT to Use

| Situation | Better Alternative |
|-----------|-------------------|
| Designing a GraphQL API | Use schema-first design with GraphQL type system; this skill covers REST conventions only |
| Building a gRPC service | Use Protocol Buffers and gRPC service definitions; gRPC uses different conventions (camelCase, unary/streaming RPCs) |
| WebSocket-only real-time APIs | Design event-driven message formats; REST is request/response oriented |
| Simple internal HTTP utilities | A lightweight JSON schema or inline comments may suffice — no need for full OpenAPI |
| Microservice internal communication (service-to-service) | Consider gRPC or message queues; REST is optimized for client-facing APIs |

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

## References

- **OpenAPI Templates** — See `references/openapi-templates.md` for ready-to-use OpenAPI 3.x YAML templates covering a complete CRUD API with security, pagination, and error schemas.
