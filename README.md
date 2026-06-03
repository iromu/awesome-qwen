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
| [api-design](skills/api-design) | Design RESTful APIs following OpenAPI 3.0 conventions with proper resource naming, versioning, and error handling | `1.0.0` | ![api](https://img.shields.io/badge/api-blue) ![rest](https://img.shields.io/badge/rest-blue) ![openapi](https://img.shields.io/badge/openapi-blue) |
| [database-migration](skills/database-migration) | Create and manage database migrations with rollback support for SQL databases | `1.0.0` | ![database](https://img.shields.io/badge/database-blue) ![migration](https://img.shields.io/badge/migration-blue) ![sql](https://img.shields.io/badge/sql-blue) |
| [docker-containerize](skills/docker-containerize) | Dockerize applications with optimized multi-stage builds, security, and best practices | `1.0.0` | ![docker](https://img.shields.io/badge/docker-blue) ![containers](https://img.shields.io/badge/containers-blue) ![multi-stage](https://img.shields.io/badge/multi-stage-blue) |
| [git-workflows](skills/git-workflows) | Git branching strategies, commit conventions, and collaboration workflows | `1.0.0` | ![git](https://img.shields.io/badge/git-blue) ![branching](https://img.shields.io/badge/branching-blue) ![commits](https://img.shields.io/badge/commits-blue) |
| [security-audit](skills/security-audit) | Perform security scanning for OWASP vulnerabilities, dependency issues, and secrets exposure | `1.0.0` | ![security](https://img.shields.io/badge/security-blue) ![owasp](https://img.shields.io/badge/owasp-blue) ![scanning](https://img.shields.io/badge/scanning-blue) |
| [self-improvement-protocol](skills/self-improvement-protocol) | Implements a closed-loop self-learning system where the agent creates skills from experience, maintains persistent memory, and improves over time through skill refinement | `1.0.0` |  |
| [self-learning-loop](skills/self-learning-loop) | Implements a closed-loop self-learning system where the agent creates skills from experience, maintains persistent memory, and improves over time through trajectory compression and skill refinement | `1.0.0` |  |

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
