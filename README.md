# Awesome Qwen

> A curated collection of extensions, skills, agents, and workflows for [Qwen Code](https://github.com/QwenLM/Qwen).

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Contents

- [Agents](#agents)
- [Instructions](#instructions)
- [Skills](#skills)
- [Hooks](#hooks)
- [Workflows](#workflows)
- [Cookbook](#cookbook)

## Agents

Specialized AI personas with specific tool access and expertise.

| Agent | Description | Model |
|-------|-------------|--------|
| [Test Architect](agents/test-architect.agent.md) | Comprehensive testing specialist - unit, integration, E2E, TDD, and test strategy | <code>qwen-plus</code> |
| [DevOps Engineer](agents/devops-engineer.agent.md) | Infrastructure, CI/CD pipelines, containerization, cloud deployment, and monitoring | <code>qwen-plus</code> |
| [Debugging Expert](agents/debugging-expert.agent.md) | Root-cause analysis, stack trace diagnosis, regression bisection, and error reproduction | <code>qwen-max</code> |
| [Code Reviewer](agents/code-reviewer.agent.md) | Expert code review specialist - security, performance, code quality, and best practices | <code>qwen-max</code> |

## Instructions

Automated coding standards and guidelines applied by file pattern.

| Instruction | Description | Applies To |
|-------------|-------------|------------|
| [typescript-best-practices.instructions.md](instructions/typescript-best-practices.instructions.md) | Enforce TypeScript best practices including strict mode, no-explicit-any avoidance, and proper type inference | `**/*.ts` |
| [react-best-practices.instructions.md](instructions/react-best-practices.instructions.md) | Enforce React functional component patterns, hooks usage, and performance optimization | `**/*.{jsx,tsx}` |
| [python-conventions.instructions.md](instructions/python-conventions.instructions.md) | Enforce Python PEP 8 conventions, type hints, and modern Python patterns | `**/*.py` |

## Skills

Self-contained capabilities for specific tasks, bundling instructions and assets.

| Skill | Description | Version | Tags |
|-------|-------------|---------|------|
| [agentic-patterns-extra](skills/agentic-patterns-extra) | Curated catalogue of 140+ agentic AI patterns — real-world tricks, workflows, and mini-architectures for autonomous agents | `1.0.0` | ![agents](https://img.shields.io/badge/agents-blue) ![patterns](https://img.shields.io/badge/patterns-blue) ![architecture](https://img.shields.io/badge/architecture-blue) |
| [api-design](skills/api-design) | Design RESTful APIs following OpenAPI 3.0 conventions with proper resource naming, versioning, and error handling | `1.0.0` | ![api](https://img.shields.io/badge/api-blue) ![rest](https://img.shields.io/badge/rest-blue) ![openapi](https://img.shields.io/badge/openapi-blue) |
| [database-migration](skills/database-migration) | Create and manage database migrations with rollback support for SQL databases | `1.0.0` | ![database](https://img.shields.io/badge/database-blue) ![migration](https://img.shields.io/badge/migration-blue) ![sql](https://img.shields.io/badge/sql-blue) |
| [docker-containerize](skills/docker-containerize) | Dockerize applications with optimized multi-stage builds, security, and best practices | `1.0.0` | ![docker](https://img.shields.io/badge/docker-blue) ![containers](https://img.shields.io/badge/containers-blue) ![multi-stage](https://img.shields.io/badge/multi-stage-blue) |
| [embabel-agent](skills/embabel-agent) | Build agentic AI applications on the JVM with Embabel — a Spring-based framework for agents mixing LLM interactions with code and planning | `1.0.0` | ![jvm](https://img.shields.io/badge/jvm-blue) ![spring](https://img.shields.io/badge/spring-blue) ![agents](https://img.shields.io/badge/agents-blue) |
| [git-workflows](skills/git-workflows) | Git branching strategies, commit conventions, and collaboration workflows | `1.0.0` | ![git](https://img.shields.io/badge/git-blue) ![branching](https://img.shields.io/badge/branching-blue) ![commits](https://img.shields.io/badge/commits-blue) |
| [rabbitmq-typescript](skills/rabbitmq-typescript) | Expert RabbitMQ developer for TypeScript/Node.js applications using amqplib — exchanges, queues, reliability, and performance patterns | `1.0.0` | ![rabbitmq](https://img.shields.io/badge/rabbitmq-blue) ![typescript](https://img.shields.io/badge/typescript-blue) ![amqp](https://img.shields.io/badge/amqp-blue) |
| [security-audit](skills/security-audit) | Perform security scanning for OWASP vulnerabilities, dependency issues, and secrets exposure | `1.0.0` | ![security](https://img.shields.io/badge/security-blue) ![owasp](https://img.shields.io/badge/owasp-blue) ![scanning](https://img.shields.io/badge/scanning-blue) |
| [self-learning](skills/self-learning) | Closed-loop self-learning system where the agent creates skills from experience, maintains persistent memory, and improves over time | `1.0.0` | ![self-learning](https://img.shields.io/badge/self-learning-blue) ![memory](https://img.shields.io/badge/memory-blue) ![skills](https://img.shields.io/badge/skills-blue) |
| [spring-ai-mcp](skills/spring-ai-mcp) | Build Spring AI MCP (Model Context Protocol) servers and clients with Boot Starters, annotations, security, and testing | `1.0.0` | ![spring](https://img.shields.io/badge/spring-blue) ![mcp](https://img.shields.io/badge/mcp-blue) ![ai](https://img.shields.io/badge/ai-blue) |

## Hooks

Automated actions triggered during Qwen Code sessions.

| Hook | Description | Trigger |
|------|-------------|---------|
| [Load Memory on Startup](hooks/load-memory-on-startup) | Inject previously saved decisions and context into the new session for seamless continuity | `SessionStart` |
| [Run Tests After Edits](hooks/run-tests-after-edits) | Automatically run tests after any file is edited to ensure changes don't break the build | `PostToolUse` |
| [Save Decisions on Stop](hooks/save-decisions-on-stop) | Extract and persist any decisions made during the session into memory for cross-session continuity | `Stop` |

## Workflows

AI-powered automation sequences for repetitive development tasks.

| Workflow | Description |
|----------|-------------|
| [Daily Code Review Summary](workflows/daily-code-review-summary.md) | Generate a daily summary of all PRs opened, updated, and merged with quality metrics |
| [Automated Release Notes](workflows/automated-release-notes.md) | Generate release notes from PRs, commits, and issues for a given release version |

## Cookbook

Copy-paste-ready recipes and examples for working with Qwen Code APIs.

- [JavaScript/TypeScript](cookbook/javascript/)
- [Python](cookbook/python/)
- [Java](cookbook/java/)
- [Go](cookbook/go/)
- [Rust](cookbook/rust/)

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## License

[MIT](LICENSE) © [iromu](https://github.com/iromu)
