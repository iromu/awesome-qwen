---
name: docker-containerize
description: >
  Dockerize an application, write a Dockerfile, create multi-stage builds, set up Docker Compose,
  optimize image size, configure buildx for multi-platform builds, use Compose profiles, or need
  best practices for container security and performance. Use this skill when the user mentions
  Docker, containerization, Dockerfile optimization, image hardening, or multi-service orchestration,
  even if they don't explicitly say "Docker."
version: 1.0.0
category: devops
tags: [docker, containers, multi-stage, security, buildx, compose]
---

# Docker Containerization

## When to Use

- Creating a Dockerfile for a new application
- Optimizing existing Dockerfiles for size or build time
- Setting up Docker Compose for multi-service applications
- Hardening container security (non-root, minimal base images)
- Building multi-platform images (ARM/x86) with Docker Buildx
- Using Docker Compose profiles for environment-specific services

## Procedure

### 1. Multi-Stage Build Pattern

Multi-stage builds separate build dependencies from runtime, producing minimal production images.

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

**Key principles:**
- Pin base image versions (e.g., `node:20-alpine` not `node:latest`)
- Use Alpine or distroless images for smaller footprints
- Install production dependencies only in the final stage
- Run as non-root with `USER` directive
- Add `HEALTHCHECK` for orchestration awareness

### 2. Multi-Platform Builds with buildx

Build and push images for multiple architectures (amd64, arm64) in one command:

```bash
# Create a buildx builder (one-time setup)
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build and push multi-platform image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest \
  --push \
  .
```

For local multi-platform testing:

```bash
# Build for both platforms (stores in build cache, no push)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t myapp:latest \
  --load \
  .
```

### 3. Docker Compose with Profiles

Use Compose profiles to conditionally include services (e.g., dev tools, monitoring):

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

  # Only started with 'docker compose --profile dev up'
  redis:
    image: redis:7-alpine
    profiles: ["dev", "cache"]
    ports:
      - "6379:6379"

  # Only started with 'docker compose --profile monitoring up'
  prometheus:
    image: prom/prometheus:latest
    profiles: ["monitoring"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

volumes:
  pgdata:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

Usage:

```bash
# Default services only (app + db)
docker compose up -d

# Include dev tools
docker compose --profile dev up -d

# Include monitoring stack
docker compose --profile monitoring up -d

# All profiles
docker compose --profile dev --profile monitoring up -d
```

### 4. .dockerignore

Always include a `.dockerignore` to reduce build context and prevent leaks:

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

### 5. Container Security Hardening

```dockerfile
# Use distroless for minimal attack surface (Google)
FROM gcr.io/distroless/nodejs20

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nonroot:nonroot
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

**Security checklist:**
- Use minimal base images (Alpine, distroless, slim variants)
- Run as non-root user
- Scan images with `docker scan`
- Pin image digests for reproducibility (`node:20-alpine@sha256:...`)
- Use secrets for sensitive data, not env vars in Dockerfile
- Set read-only root filesystem where possible (`--read-only`)

## Pitfalls

- ❌ Don't run containers as root — use `USER <non-root>`
- ⚠️ Don't copy `.env` files into images — use secrets or runtime env vars
- ❌ Don't use `latest` tag for production — pin versions or digests
- ⚠️ `COPY . .` before dependency install breaks layer caching — copy `package*.json` first
- ❌ Don't include dev dependencies in production images — use `--omit=dev` or separate stages
- ⚠️ ARM/x86 cross-platform builds need `docker buildx` — don't use plain `docker build`
- ❌ Don't bake secrets into image layers — use Docker secrets or runtime injection
- ⚠️ Large `.dockerignore` exclusions can cause unexpected missing files — be specific
- ❌ Don't use `ADD` unless you need tar auto-extraction — prefer `COPY`

## When NOT to Use This Skill

| Situation | Better Alternative |
|-----------|-------------------|
| Deploying to a managed platform (Heroku, Render, Vercel) | Use platform-native deployment — they handle containerization |
| Serverless / function-as-a-service (AWS Lambda, Cloud Functions) | Use serverless framework or cloud provider tooling |
| Kubernetes-native workloads with complex operators | Use Helm charts or Kustomize for orchestration |
| Simple one-off scripts | Use `docker run --rm` directly without a Dockerfile |
| When the platform handles containerization automatically | Rely on the platform's build system (e.g., GitHub Container Registry) |

## Verification

- [ ] Image size is optimized (use `dive` to inspect layers)
- [ ] Container runs as non-root user
- [ ] Health check is configured and passing
- [ ] No secrets baked into image
- [ ] `docker scan` shows no critical vulnerabilities
- [ ] Multi-platform builds work if needed (`linux/amd64`, `linux/arm64`)
- [ ] Compose profiles work for environment-specific services
- [ ] `.dockerignore` excludes unnecessary files

## References

- Docker best practices: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- Dive (image inspection): https://github.com/wagoodman/dive
- Buildx multi-platform builds: https://docs.docker.com/build/building/multi-platform/
- Compose profiles: https://docs.docker.com/compose/profiles/
- Example Dockerfiles for common stacks in `references/example-dockerfiles.md`
