---
name: docker-containerize
description: Dockerize applications with optimized multi-stage builds, security, and best practices
version: 1.0.0
category: devops
tags: ["docker", "containers", "multi-stage", "security"]
---

# Docker Containerization

## When to Use
- Creating a Dockerfile for a new application
- Optimizing existing Dockerfiles for size or build time
- Setting up Docker Compose for multi-service applications
- Hardening container security

## Procedure

### 1. Multi-Stage Build Pattern
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

### 2. Docker Compose for Services
```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://db:5432/myapp
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 3. .dockerignore
```
node_modules
npm-debug.log
.git
.dockerignore
Dockerfile
docker-compose*.yml
.env
.env.*
coverage
.vscode
.idea
```

## Pitfalls
- ❌ Don't run containers as root - use `USER <non-root>`
- ⚠️ Don't copy `.env` files into images - use secrets or env vars at runtime
- ❌ Don't use `latest` tag for production - pin versions
- ⚠️ `COPY . .` before dependency install breaks layer caching
- ❌ Don't include dev dependencies in production images
- ⚠️ ARM/x86 cross-platform builds need `docker buildx`

## Verification
- [ ] Image size is optimized (use `dive` to inspect layers)
- [ ] Container runs as non-root user
- [ ] Health check is configured and passing
- [ ] No secrets baked into image
- [ ] `docker scan` shows no critical vulnerabilities
- [ ] Works on both ARM and x86 (if needed)

## References
- Docker best practices: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- Dive (image inspection): https://github.com/wagoodman/dive
