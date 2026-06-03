# Contributing to Awesome Qwen

Thank you for your interest in contributing! This guide explains how to add your skills, agents, workflows, and other content to this collection.

## Table of Contents

- [What We Accept](#what-we-accept)
- [How to Contribute](#how-to-contribute)
- [Content Guidelines](#content-guidelines)
- [Creating Skills](#creating-skills)
- [Creating Agents](#creating-agents)
- [Creating Workflows](#creating-workflows)
- [Creating Hooks](#creating-hooks)
- [Creating Cookbook Entries](#creating-cookbook-entries)
- [Validation](#validation)
- [Pull Request Process](#pull-request-process)

## What We Accept

| Type | Description | Directory |
|------|-------------|-----------|
| **Agent** | Specialized AI personas with specific expertise and tool access | `agents/` |
| **Instruction** | Coding standards applied automatically by file pattern | `instructions/` |
| **Skill** | Self-contained task capability with instructions and assets | `skills/<name>/` |
| **Hook** | Automated actions triggered during Qwen Code sessions | `hooks/<name>/` |
| **Workflow** | Reusable automation sequences for repetitive tasks | `workflows/` |
| **Cookbook** | Copy-paste-ready recipes organized by language | `cookbook/<lang>/` |

## How to Contribute

1. **Fork** the repository
2. **Create a branch** for your contribution
3. **Add your content** following the format guidelines below
4. **Run validation**: `npm install && npm run validate`
5. **Generate README**: `npm run build`
6. **Submit a Pull Request**

## Content Guidelines

### General Rules
- Content must be **specific and actionable** - not vague advice
- Include **real examples** with code snippets
- Document **pitfalls and edge cases** discovered through experience
- Use **English** for all documentation
- Keep descriptions concise but complete
- Link to relevant external documentation when helpful

### Quality Standards
- Test your skill/agent/workflow before submitting
- Use proper formatting with code blocks and tables
- Include verification steps
- Add tags for categorization and searchability

## Creating Skills

Skills are the core building blocks. Each skill is a directory with a `SKILL.md` file:

```
skills/
└── my-skill/
    ├── SKILL.md              # Required - main instructions
    ├── references/           # Optional - additional docs
    ├── templates/            # Optional - output templates
    ├── scripts/              # Optional - helper scripts
    └── assets/               # Optional - supplementary files
```

### SKILL.md Format

```markdown
---
name: my-skill                    # Must match folder name, max 64 chars
description: What this skill does # 10-1024 characters
version: 1.0.0                    # Semantic version
category: development             # See categories below
tags: ["tag1", "tag2"]           # Optional categorization
---

# Skill Title

## When to Use
- Trigger condition 1
- Trigger condition 2

## Procedure
1. Step one with exact commands
2. Step two with verification
3. Step three

## Pitfalls
- ⚠️ Common issue or edge case
- ❌ What not to do

## Verification
- [ ] Check 1
- [ ] Check 2
```

### Quick Create
```bash
npm install
npm run create:skill -- --name my-skill --description "What it does" --category development
```

## Creating Agents

Agents are markdown files with `.agent.md` extension:

```
agents/
└── my-agent.agent.md
```

### Agent Format

```markdown
---
name: My Agent
description: What this agent does
model: qwen-max                    # Recommended model
category: development              # Agent category
tools: ["codebase", "terminal"]    # Tool access needed
tags: ["tag1", "tag2"]
---

# My Agent

## Role
Describe the agent's expertise.

## Behavior
- How the agent approaches problems
- Communication style
- Decision-making patterns

## Examples
Example interactions and workflows.
```

### Quick Create
```bash
npm run create:agent -- --name "My Agent" --description "What it does" --model qwen-max
```

## Creating Workflows

Workflows are markdown files with YAML frontmatter:

```
workflows/
└── my-workflow.md
```

### Workflow Format

```markdown
---
name: My Workflow
description: What this workflow does
on:
  schedule: "0 9 * * 1-5"    # Cron schedule (optional)
  event: manual               # Event trigger (optional)
permissions:
  contents: read
  pull_requests: read
tags: ["tag1", "tag2"]
category: ci-cd
---

# My Workflow

## What This Does
Description of the automation.

## How to Use
Setup instructions and trigger methods.

## Output Format
Expected output example.
```

## Creating Hooks

Hooks are directories with `README.md` and `hooks.json`:

```
hooks/
└── my-hook/
    ├── README.md      # Documentation with frontmatter
    └── hooks.json     # Hook configuration
```

### Hook README Format

```markdown
---
name: My Hook
description: What this hook does
event: PostToolUse              # When it triggers
matcher: "regex"               # Optional command filter
tags: ["tag1", "tag2"]
---

# My Hook

## What This Does
Explanation.

## Setup
How to configure it.

## When to Use
Appropriate use cases.
```

### hooks.json Format

```json
{
  "name": "My Hook",
  "description": "What this hook does",
  "event": "PostToolUse",
  "matcher": "^regex$",
  "command": "path/to/script.sh",
  "timeout": 30000,
  "tags": ["tag1", "tag2"]
}
```

## Creating Cookbook Entries

Cookbook entries are `README.md` files in language-specific directories:

```
cookbook/
├── javascript/
│   └── README.md
├── python/
│   └── README.md
├── java/
│   └── README.md
├── go/
│   └── README.md
└── rust/
│   └── README.md
```

### Cookbook Format

```markdown
# Language Cookbook

## Table of Contents
- [Recipe 1](#recipe-1)
- [Recipe 2](#recipe-2)

---

## Recipe 1

**Prompt**: "What to ask Qwen"

\`\`\`bash
# Commands Qwen will run
\`\`\`

\`\`\`language
# Code Qwen will generate
\`\`\`
```

## Validation

Before submitting, validate your contribution:

```bash
npm install
npm run validate    # Check all content against schemas
npm run build       # Regenerate README tables
```

The validation checks:
- ✅ Required frontmatter fields present
- ✅ Field formats correct (names, versions, patterns)
- ✅ Skill names match folder names
- ✅ No duplicate entries
- ✅ File structure follows conventions

## Pull Request Process

1. **Target the `main` branch**
2. **Describe what you're adding** in the PR description
3. **Ensure CI passes** (validation + build)
4. **Be responsive** to review feedback
5. **Update your content** if requested

### PR Title Format
Use conventional commits:
```
feat(skills): add docker-containerize skill
feat(agents): add code-reviewer agent
docs(cookbook): add Python recipes
fix(hooks): correct run-tests script path
```

## Categories

Use these standard categories:

| Category | Use For |
|----------|---------|
| `development` | General coding, refactoring, patterns |
| `debugging` | Root cause analysis, troubleshooting |
| `testing` | Unit tests, integration, E2E, TDD |
| `devops` | CI/CD, containers, infrastructure |
| `security` | Vulnerability scanning, hardening |
| `documentation` | Docs generation, API specs |
| `data` | Data processing, ETL, analytics |
| `frontend` | UI frameworks, CSS, styling |
| `backend` | APIs, databases, servers |
| `mobile` | iOS, Android, cross-platform |
| `ai-ml` | ML pipelines, model serving |

## Questions?

Open an [issue](https://github.com/iromu/awesome-qwen/issues) if you have questions about:
- Whether your content is a good fit
- How to format something
- Suggesting new categories or features

Thank you for contributing! 🎉
