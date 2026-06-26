# Awesome Qwen

> A curated collection of extensions, skills, agents, and workflows for [Qwen Code](https://github.com/QwenLM/Qwen).

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is this?

**Awesome Qwen** is a curated catalogue of battle-tested building blocks for [Qwen Code](https://github.com/QwenLM/Qwen) — the open-source, code-capable AI coding assistant. Each entry is a ready-to-use component you can drop into your Qwen Code workspace to extend its capabilities.

Think of it as a pre-vetted toolbox so you don't have to reinvent the wheel every time you need a code reviewer, a testing agent, or a RabbitMQ TypeScript skill.

## Quick Start

1. **Browse** the categories below to find what you need.
2. **Copy** the relevant directory (`skills/<name>/`, `agents/<name>.agent.md`, etc.) into your own Qwen Code project.
3. **Reference** it in your Qwen Code config or conversation to activate it.

No build step, no dependencies — just markdown files Qwen Code auto-discovers.

## Contents

| Category | Description | Count |
|----------|-------------|-------|
| [Agents](#agents) | Specialized AI personas with specific tool access and expertise | 4 |
| [Instructions](#instructions) | Coding standards applied automatically by file pattern | 3 |
| [Skills](#skills) | Self-contained capabilities for specific tasks | 25 |
| [Hooks](#hooks) | Automated actions triggered during Qwen Code sessions | 3 |
| [Workflows](#workflows) | Reusable automation sequences (coming soon) | 0 |
| [Cookbook](#cookbook) | Language-specific recipes and examples (coming soon) | 0 |

---

## Agents

Specialized AI personas with specific expertise, tool access, and behavior profiles.

| Agent | Description | Recommended Model |
|-------|-------------|-------------------|
| [Test Architect](agents/test-architect.agent.md) | Comprehensive testing specialist — unit, integration, E2E, TDD, and test strategy | `qwen-plus` |
| [DevOps Engineer](agents/devops-engineer.agent.md) | Infrastructure, CI/CD pipelines, containerization, cloud deployment, and monitoring | `qwen-plus` |
| [Debugging Expert](agents/debugging-expert.agent.md) | Root-cause analysis, stack trace diagnosis, regression bisection, and error reproduction | `qwen-max` |
| [Code Reviewer](agents/code-reviewer.agent.md) | Expert code review — security, performance, code quality, and best practices | `qwen-max` |

## Instructions

Automated coding standards and guidelines applied by file pattern.

| Instruction | Applies To | Description |
|-------------|------------|-------------|
| [TypeScript Best Practices](instructions/typescript-best-practices.instructions.md) | `**/*.ts` | Strict mode, no-explicit-any avoidance, proper type inference |
| [React Best Practices](instructions/react-best-practices.instructions.md) | `**/*.{jsx,tsx}` | Functional components, hooks usage, performance optimization |
| [Python Conventions](instructions/python-conventions.instructions.md) | `**/*.py` | PEP 8, type hints, modern Python patterns |

## Skills

Self-contained capabilities bundling instructions, references, templates, and scripts.

| Skill | Description | Tags |
|-------|-------------|------|
| [htmx](skills/htmx) | Build interactive web UIs with declarative AJAX — hx-get, hx-post, hx-trigger, hx-swap, hx-boost, real-time updates, CSS transitions, WebSockets, SSE, inline editing, infinite scroll, active search, progress bars, and out-of-band swaps | `htmx` `hypermedia` `ajax` `server-side` `no-javascript` |
| [agentic-patterns-core](skills/agentic-patterns-core) | 21 agentic design patterns distilled from production — prompt chaining, routing, parallelization, reflection, tool use, planning, multi-agent collaboration, and more | `agentic` `patterns` `architecture` |
| [agentic-patterns-extra](skills/agentic-patterns-extra) | 180+ agentic AI patterns across 8 categories — context management, multi-agent coordination, reliability, security, feedback loops, and learning | `agentic` `patterns` `catalogue` |
| [agentic-patterns-research](skills/agentic-patterns-research) | Research-backed techniques and production-proven architectures for reliable, safe, and cost-effective agents | `agentic` `research` `best-practices` |
| [api-design](skills/api-design) | Design RESTful APIs following OpenAPI 3.0 conventions with proper resource naming, versioning, and error handling | `api` `rest` `openapi` |
| [api-testing](skills/api-testing) | Test APIs with automated request generation, response validation, and contract testing | `api` `testing` `validation` |
| [code-review](skills/code-review) | Automated code review with security, performance, and quality checks | `review` `security` `quality` |
| [database-migration](skills/database-migration) | Create database migrations, write rollback scripts, and perform zero-downtime schema changes across PostgreSQL, MySQL, and SQLite | `database` `migration` `sql` `schema` |
| [docker-containerize](skills/docker-containerize) | Dockerize applications with optimized multi-stage builds, security hardening, and best practices | `docker` `containers` `multi-stage` |
| [embabel-agent](skills/embabel-agent) | Build agentic AI applications on the JVM with Embabel — a Spring-based framework by Rod Johnson for agents mixing LLMs with code and planning algorithms | `jvm` `spring` `agents` |
| [embabel-chatbot](skills/embabel-chatbot) | Build agentic chatbots with RAG, guardrails, reasoning, and custom chat extensions | `chatbot` `rag` `jvm` |
| [embabel-dice](skills/embabel-dice) | Build proposition-based knowledge graphs for AI agents — structured, confidence-weighted memory with entity resolution | `knowledge-graph` `memory` `jvm` |
| [embabel-drivine4j](skills/embabel-drivine4j) | Type-safe graph database clients for Neo4j, FalkorDB, Amazon Neptune, and Memgraph | `graph` `neo4j` `jvm` |
| [embabel-otel](skills/embabel-otel) | Configure OpenTelemetry exporters for Embabel Agent observability — zero-code setup for Langfuse and LangSmith trace export with automatic span enrichment | `opentelemetry` `langfuse` `langsmith` `tracing` |
| [git-commit](skills/git-commit) | Automated git commit message generation with conventional commit style | `git` `commits` |
| [git-workflows](skills/git-workflows) | Git branching strategies, commit conventions, and collaboration workflows | `git` `branching` `collaboration` |
| [json-formatting](skills/json-formatting) | Format, pretty-print, minify, validate, transform, and convert JSON data | `json` `formatting` `validation` |
| [rabbitmq-typescript](skills/rabbitmq-typescript) | Expert RabbitMQ development for TypeScript/Node.js using amqplib — exchanges, queues, DLX, publisher confirms | `rabbitmq` `typescript` `messaging` |
| [security-audit](skills/security-audit) | Scan for CVEs, detect secrets, run SAST, audit OWASP Top 10, and check container/IaC security | `security` `owasp` `scanning` `sast` `secrets` |
| [self-learning](skills/self-learning) | Closed-loop self-learning system — agents create skills from experience, maintain persistent memory, and improve over time | `learning` `memory` `autonomous` |
| [skill-creator](skills/skill-creator) | Create, edit, improve, and evaluate skills — the meta-tool for building Qwen Code skills | `skill-authoring` `eval` |
| [spring-ai-mcp](skills/spring-ai-mcp) | Build Spring AI MCP (Model Context Protocol) servers and clients with annotations, security, and testing | `spring` `mcp` `ai` |
| [test-skill](skills/test-skill) | Test skill development patterns and evaluation methodologies | `testing` `skills` |
| [yaml-validation](skills/yaml-validation) | Validate, lint, and fix YAML files with schema checking and type coercion detection | `yaml` `validation` `linting` |
| [yaml-validator](skills/yaml-validator) | Validate, lint, and fix YAML files — syntax checking, indentation, special characters, and format conversion | `yaml` `validation` |

## Hooks

Automated actions triggered during Qwen Code sessions.

| Hook | Trigger | Description |
|------|---------|-------------|
| [Load Memory on Startup](hooks/load-memory-on-startup) | `SessionStart` | Inject previously saved decisions and context into the new session for seamless continuity |
| [Run Tests After Edits](hooks/run-tests-after-edits) | `PostToolUse` | Automatically run tests after any file is edited to ensure changes don't break the build |
| [Save Decisions on Stop](hooks/save-decisions-on-stop) | `Stop` | Extract and persist decisions made during the session into memory for cross-session continuity |
