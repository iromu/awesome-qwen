# Example Dockerfiles for Common Stacks

## Node.js (Express / Fastify)

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
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

## Next.js

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Rebuild source only when files change
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000 || exit 1
CMD ["node", "server.js"]
```

## Go

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/server

# Production stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/server .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["./server"]
```

## Java (Spring Boot)

```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:21-jre-alpine AS production
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/actuator/health || exit 1
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

## Python (FastAPI)

```dockerfile
# Build stage
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir --prefix=/install -r requirements.txt

# Production stage
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /install /install
COPY . .
ENV PATH=/install/bin:$PATH
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Rust

```dockerfile
# Build stage
FROM rust:1.75-alpine AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY . .
RUN cargo build --release

# Production stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/target/release/myapp .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["./myapp"]
```

## Ruby (Rails)

```dockerfile
# Build stage
FROM ruby:3.3-alpine AS builder
WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN apk add --no-cache build-base libpq-dev postgresql-dev
RUN bundle config set force_ruby_platform true && bundle install --jobs 4 --retry 3
COPY . .
RUN RAILS_ENV=production bundle exec rake assets:precompile

# Production stage
FROM ruby:3.3-alpine
WORKDIR /app
COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY --from=builder /app .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3000
ENV RAILS_ENV=production
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
```

## PHP (Laravel)

```dockerfile
# Build stage
FROM php:8.3-fpm-alpine AS builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN docker-php-ext-install pdo_mysql
RUN composer install --no-dev --optimize-autoloader

# Production stage
FROM php:8.3-fpm-alpine
WORKDIR /app
COPY --from=builder /app .
RUN apk add --no-cache nginx supervisor curl
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisor/supervisord.conf
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:80/health || exit 1
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
```

## Static Site (Nginx)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

## Deno

```dockerfile
FROM denoland/deno:2.0-alpine AS builder
WORKDIR /app
COPY . .
RUN deno cache --reload main.ts

# Production stage
FROM denoland/deno:2.0-alpine
WORKDIR /app
COPY --from=builder /app/.deno/cache /root/.cache/deno
COPY . .
USER deno
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD deno eval "await fetch('http://localhost:8000/health')" || exit 1
CMD ["run", "--allow-net", "main.ts"]
```

## Go (static binary with scratch)

```dockerfile
# Build stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w -extldflags '-static'" -o /app/server

# Production stage — minimal scratch image
FROM scratch
WORKDIR /app
COPY --from=builder /app/server .
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD ["/app/server", "healthcheck"] || exit 1
CMD ["/app/server"]
```
