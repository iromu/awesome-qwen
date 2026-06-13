# OpenAPI 3.x Template

A complete, production-ready OpenAPI 3.1 template for a RESTful CRUD API. Copy and adapt this file for your own services.

---

## Full API Template

```yaml
openapi: 3.1.0
info:
  title: MyService API
  description: >
    A production-ready REST API with full CRUD, pagination, filtering,
    and consistent error handling.
  version: 1.0.0
  contact:
    name: API Support
    email: api@example.com
  license:
    name: MIT

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://api-staging.example.com/v1
    description: Staging

tags:
  - name: Users
    description: User management operations
  - name: Orders
    description: Order management operations

paths:
  /users:
    get:
      summary: List all users
      description: Returns a paginated list of users with optional filtering.
      operationId: listUsers
      tags:
        - Users
      parameters:
        - name: limit
          in: query
          description: Maximum number of results (default: 20, max: 100)
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: offset
          in: query
          description: Number of results to skip (default: 0)
          required: false
          schema:
            type: integer
            minimum: 0
            default: 0
        - name: sort
          in: query
          description: Sort field (prefix with - for descending)
          required: false
          schema:
            type: string
            example: "-createdAt"
        - name: filter
          in: query
          description: >
            Filter by field value. Format: `field=value`.
            Multiple filters: `filter=name:Alice&filter=status:active`
          required: false
          schema:
            type: string
      responses:
        "200":
          description: A paginated list of users.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaginatedUserList"
              example:
                data:
                  - id: "usr_abc123"
                    name: "Alice"
                    email: "alice@example.com"
                    status: "active"
                    createdAt: "2025-01-15T10:30:00Z"
                pagination:
                  total: 150
                  limit: 20
                  offset: 0
                  hasMore: true
        "400":
          $ref: "#/components/responses/BadRequest"
        "500":
          $ref: "#/components/responses/InternalServerError"
      security:
        - bearerAuth: []

    post:
      summary: Create a new user
      description: Creates and returns a new user resource.
      operationId: createUser
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUserRequest"
            example:
              name: "Alice"
              email: "alice@example.com"
              role: "member"
      responses:
        "201":
          description: User created successfully.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
          headers:
            Location:
              description: URI of the newly created resource.
              required: true
              schema:
                type: string
                format: uri
                example: "/v1/users/usr_abc123"
        "400":
          $ref: "#/components/responses/BadRequest"
        "409":
          $ref: "#/components/responses/Conflict"
        "500":
          $ref: "#/components/responses/InternalServerError"
      security:
        - bearerAuth: []

  /users/{userId}:
    get:
      summary: Get a user by ID
      description: Returns a single user by their unique identifier.
      operationId: getUser
      tags:
        - Users
      parameters:
        - name: userId
          in: path
          required: true
          description: The unique user identifier.
          schema:
            type: string
            format: uuid
            example: "usr_abc123"
      responses:
        "200":
          description: User found.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "404":
          $ref: "#/components/responses/NotFound"
        "500":
          $ref: "#/components/responses/InternalServerError"
      security:
        - bearerAuth: []

    put:
      summary: Replace a user
      description: >
        Replaces the entire user resource. Send all fields; missing fields
        are treated as null.
      operationId: replaceUser
      tags:
        - Users
      parameters:
        - name: userId
          in: path
          required: true
          description: The unique user identifier.
          schema:
            type: string
            format: uuid
            example: "usr_abc123"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/User"
      responses:
        "200":
          description: User replaced successfully.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          $ref: "#/components/responses/BadRequest"
        "404":
          $ref: "#/components/responses/NotFound"
        "500":
          $ref: "#/components/responses/InternalServerError"
      security:
        - bearerAuth: []

    patch:
      summary: Partially update a user
      description: Applies only the provided fields to the existing user.
      operationId: patchUser
      tags:
        - Users
      parameters:
        - name: userId
          in: path
          required: true
          description: The unique user identifier.
          schema:
            type: string
            format: uuid
            example: "usr_abc123"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateUserRequest"
      responses:
        "200":
          description: User updated successfully.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          $ref: "#/components/responses/BadRequest"
        "404":
          $ref: "#/components/responses/NotFound"
        "500":
          $ref: "#/components/responses/InternalServerError"
      security:
        - bearerAuth: []

    delete:
      summary: Delete a user
      description: Permanently removes a user. Idempotent.
      operationId: deleteUser
      tags:
        - Users
      parameters:
        - name: userId
          in: path
          required: true
          description: The unique user identifier.
          schema:
            type: string
            format: uuid
            example: "usr_abc123"
      responses:
        "204":
          description: User deleted. No response body.
        "404":
          $ref: "#/components/responses/NotFound"
        "500":
          $ref: "#/components/responses/InternalServerError"
      security:
        - bearerAuth: []

  /users/{userId}/orders:
    get:
      summary: List user's orders
      description: Returns a paginated list of orders for a specific user.
      operationId: listUserOrders
      tags:
        - Orders
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: status
          in: query
          description: Filter by order status
          schema:
            type: string
            enum: [pending, confirmed, shipped, delivered, cancelled]
      responses:
        "200":
          description: Paginated list of orders.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PaginatedOrderList"
        "404":
          $ref: "#/components/responses/NotFound"

# ─── Components ───────────────────────────────────────────────────────

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >
        OAuth 2.0 Bearer token. Obtain via the `/auth/token` endpoint
        using your client credentials or user credentials.

  schemas:
    # ── Error ─────────────────────────────────────────────────────────
    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
              description: Machine-readable error code.
            message:
              type: string
              example: "Invalid email format"
              description: Human-readable error message.
            details:
              type: array
              items:
                $ref: "#/components/schemas/ErrorDetail"
              description: Optional field-level error details.
            requestId:
              type: string
              format: uuid
              description: Request correlation ID for support.
            documentationUrl:
              type: string
              format: uri
              description: Link to relevant documentation.

    ErrorDetail:
      type: object
      required: [field, issue]
      properties:
        field:
          type: string
          description: The field that caused the error.
        issue:
          type: string
          description: Description of the issue.
        value:
          description: The invalid value (omit in responses for safety).

    # ── User ──────────────────────────────────────────────────────────
    User:
      type: object
      required: [id, name, email, status, createdAt]
      properties:
        id:
          type: string
          format: uuid
          readOnly: true
          example: "usr_abc123"
        name:
          type: string
          maxLength: 128
          example: "Alice"
        email:
          type: string
          format: email
          example: "alice@example.com"
        role:
          type: string
          enum: [admin, member, viewer]
          default: member
          example: "member"
        status:
          type: string
          enum: [active, suspended, deleted]
          default: active
          example: "active"
        createdAt:
          type: string
          format: date-time
          readOnly: true
          example: "2025-01-15T10:30:00Z"
        updatedAt:
          type: string
          format: date-time
          readOnly: true
          example: "2025-06-10T14:22:00Z"

    CreateUserRequest:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 128
          example: "Alice"
        email:
          type: string
          format: email
          example: "alice@example.com"
        role:
          type: string
          enum: [admin, member, viewer]
          default: member

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
          maxLength: 128
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, member, viewer]
        status:
          type: string
          enum: [active, suspended, deleted]

    PaginatedUserList:
      type: object
      required: [data, pagination]
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/User"
        pagination:
          $ref: "#/components/schemas/PaginationMeta"

    # ── Order ─────────────────────────────────────────────────────────
    Order:
      type: object
      required: [id, userId, items, total, status, createdAt]
      properties:
        id:
          type: string
          format: uuid
          readOnly: true
        userId:
          type: string
          format: uuid
        items:
          type: array
          items:
            type: object
            required: [productId, quantity, price]
            properties:
              productId:
                type: string
                format: uuid
              quantity:
                type: integer
                minimum: 1
              price:
                type: number
                format: float
                description: Price per unit at time of order.
        total:
          type: number
          format: float
          description: Total order amount.
        status:
          type: string
          enum: [pending, confirmed, shipped, delivered, cancelled]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    PaginatedOrderList:
      type: object
      required: [data, pagination]
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/Order"
        pagination:
          $ref: "#/components/schemas/PaginationMeta"

    PaginationMeta:
      type: object
      required: [total, limit, offset]
      properties:
        total:
          type: integer
          description: Total number of records matching the query.
        limit:
          type: integer
          description: Number of records returned.
        offset:
          type: integer
          description: Offset used for this page.
        hasMore:
          type: boolean
          description: Whether more pages are available.

  responses:
    BadRequest:
      description: Invalid request parameters or body.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            error:
              code: "VALIDATION_ERROR"
              message: "Request validation failed"
              details:
                - field: "email"
                  issue: "must be a valid email address"
              requestId: "req_abc123"

    NotFound:
      description: The requested resource was not found.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            error:
              code: "NOT_FOUND"
              message: "User not found"
              requestId: "req_abc123"

    Conflict:
      description: Resource conflict (e.g., duplicate email).
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            error:
              code: "CONFLICT"
              message: "A user with this email already exists"
              details:
                - field: "email"
                  issue: "already in use"
              requestId: "req_abc123"

    InternalServerError:
      description: An unexpected server error occurred.
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          example:
            error:
              code: "INTERNAL_ERROR"
              message: "An unexpected error occurred"
              requestId: "req_abc123"

# ─── Security ─────────────────────────────────────────────────────────

security:
  - bearerAuth: []
```

---

## Quick Reference: Common Patterns

### Query Parameter Conventions

| Pattern | Example | Description |
|---------|---------|-------------|
| Pagination | `?limit=20&offset=0` | Offset-based pagination |
| Cursor | `?cursor=eyJpZCI6MTAwfQ==` | Cursor-based pagination (recommended for large datasets) |
| Sorting | `?sort=-createdAt,name` | Prefix `-` for descending; comma-separated for multi-sort |
| Filtering | `?status=active&role=admin` | Field-value pairs |
| Field selection | `?fields=id,name,email` | Return only specified fields (sparse fieldsets) |
| Search | `?q=alice` | Full-text search query |

### HTTP Method Semantics

| Method | Idempotent | Safe | Use For |
|--------|------------|------|---------|
| GET | Yes | Yes | Read-only retrieval |
| POST | No | No | Create resource, non-idempotent operations |
| PUT | Yes | No | Full resource replacement |
| PATCH | No | No | Partial resource update |
| DELETE | Yes | No | Remove resource |

### Status Code Quick Guide

| Code | When to Use |
|------|-------------|
| 200 | Success (GET, PUT, PATCH, DELETE) |
| 201 | Resource created (POST) |
| 204 | Success with no body (DELETE) |
| 400 | Bad request / validation failure |
| 401 | Not authenticated (missing/invalid token) |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, race condition) |
| 422 | Validation error with details |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

### Error Response Envelope

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "issue": "must be valid", "value": "bad" }
    ],
    "requestId": "req_abc123",
    "documentationUrl": "https://docs.example.com/errors/ERROR_CODE"
  }
}
```

---

## Validation

Run this command to validate your OpenAPI spec:

```bash
# Install
npm install -g @apidevtools/swagger-cli

# Validate
swagger-cli validate openapi.yaml

# Generate docs
npx redoc-cli bundle openapi.yaml -o docs.html
```
