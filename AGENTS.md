# AGENTS.md — Project Guidelines for Awesome-Qwen

## Project Overview

This is **Awesome Qwen**, a curated collection of extensions, skills, agents, workflows, hooks, and cookbook entries for [Qwen Code](https://github.com/QwenLM/Qwen). The project is organized as an "awesome list" with validated content in each category.

## Skill Creation Workflow

This project uses the **skill-creator** skill (bundled with Qwen Code) to create and update skills. The process follows a consistent documentation-first pattern:

### Step 1: Gather Documentation

Fetch documentation from the target project's official sources and save them locally:

```
raw/<skill-name>-docs/
├── INDEX.md                  # Master index of all docs collected
├── 01-overview.md            # Main README or framework overview
├── core/01-getting-started.md
├── reference/01-annotations.md
├── reference/02-configuration.md
└── ...
```

**Sources to check:**
- GitHub repository README (`https://github.com/<org>/<repo>`)
- Official documentation site (Docusaurus, MkDocs, AsciiDoc, etc.)
- Example projects and templates
- Related sub-projects mentioned in the main README

**Save raw content** using `raw.githubusercontent.com` URLs for clean markdown, or `web_fetch` for documentation sites. Always include source attribution at the top of each file.

### Step 2: Distill Documentation

Not all fetched content is equally useful. Distill the raw docs into a focused, actionable set:

| Keep | Remove |
|------|--------|
| Core framework overview | Old version docs superseded by newer |
| Getting started / setup | Example project READMEs (links suffice) |
| API reference (annotations, interfaces) | Separate library docs (DICE, etc.) |
| Tools, planning, state management | Tooling/scaffolding docs |
| Configuration properties | Redundant/overlapping files |
| Testing patterns | Low-value metadata files |

Aim for **10–15 files** with **1,000–2,000 lines** total — enough for a coding agent to build with the framework, without noise.

### Step 3: Create the Skill

Use the **skill-creator** skill to generate the skill from the distilled docs:

```
skills/<skill-name>/
├── SKILL.md              # Main instructions (generated)
├── references/           # Additional reference docs (optional)
├── templates/            # Output templates (optional)
├── scripts/              # Helper scripts (optional)
└── assets/               # Supplementary files (optional)
```

The `SKILL.md` should include:
- YAML frontmatter with `name`, `description`, and optional metadata
- Clear "When to Use" trigger conditions
- Step-by-step procedure with code examples
- Pitfalls and edge cases
- Verification checklist

### Step 4: Update the Awesome List README

After creating a skill, update `README.md` to include it in the skills table. Use the **update-awesome-readme** skill for this.

## Directory Structure

```
awesome-qwen/
├── agents/               # AI agent definitions (.agent.md)
├── instructions/         # Coding standards by file pattern
├── skills/               # Created skills (final output)
│   └── <skill-name>/
│       ├── SKILL.md
│       ├── references/
│       ├── templates/
│       ├── scripts/
│       └── assets/
├── hooks/                # Session-triggered automation
├── workflows/            # Reusable automation sequences
├── cookbook/             # Language-specific recipes
├── raw/                  # Raw documentation sources
│   └── <skill-name>-docs/
│       ├── INDEX.md
│       └── ...
├── .qwen/
│   └── skills/           # Auto-discovered skills (project-local)
├── README.md             # Main awesome list (auto-generated)
├── CONTRIBUTING.md       # Contribution guidelines
└── AGENTS.md             # This file
```

## Content Standards

- **Specific and actionable** — no vague advice
- **Real examples** with code snippets
- **Pitfalls documented** from experience
- **English** for all documentation
- **Proper formatting** with code blocks, tables, and checklists
