---
name: distill-framework-docs
description: Procedure for distilling fetched framework documentation into a focused, actionable set of resources for building projects
source: auto-skill
extracted_at: '2026-06-04T21:38:40.299Z'
metadata:
  internal: true
---

## Procedure: Distill Framework Documentation for Project Building

When asked to distill fetched framework documentation into a selection of resources that help a coding agent build projects with the framework:

### Step 1: Inventory All Fetched Files

List all files in the docs directory and assess each one:

```bash
find raw/<project-name>-docs -type f -name "*.md" | sort
wc -l raw/<project-name>-docs/**/*.md raw/<project-name>-docs/*/*.md 2>/dev/null | tail -1
du -sh raw/<project-name>-docs/
```

Record the total file count, line count, and size.

### Step 2: Categorize Each File

For each file, categorize it as:

| Category | What it is | Keep? |
|----------|------------|-------|
| **Core framework overview** | Main README, architecture, key concepts | KEEP |
| **Getting started** | Setup, dependencies, environment, first example | KEEP |
| **API reference** | Annotations, interfaces, methods, parameters | KEEP |
| **Planning algorithms** | GOAP, Utility, Hybrid, Supervisor | KEEP |
| **Tools** | @LlmTool, tool groups, MCP, framework-agnostic tools | KEEP |
| **State management** | @State, looping, human-in-the-loop | KEEP |
| **Testing** | Unit tests, integration tests, mocks | KEEP |
| **Chatbots** | Chatbot/ChatSession/Conversation, templates | KEEP |
| **Skills** | Skills spec, loading, execution | KEEP |
| **Configuration** | All config properties | KEEP |
| **RAG** | Retrieval-augmented generation | KEEP |
| **Invocation** | AgentInvocation, Autonomy, REST endpoints | KEEP |
| **Example projects** | Tripper, Shepherd, etc. | REMOVE (links in README suffice) |
| **Separate libraries** | DICE, project-creator, coding-agent | REMOVE (not core framework) |
| **Tooling docs** | Scripts, Maven structure, templates | REMOVE (low value for coding) |
| **Old version docs** | Superseded by newer version docs | REMOVE (keep only latest) |
| **Redundant reference** | Same topic covered in newer version | REMOVE |

### Step 3: Remove Redundant Files

**Remove old version docs** that are superseded by newer versions:
- If `01-tools.md` (v0.1.2) and `05-tools-050.md` (v0.5.0) both exist, remove the old one
- If `02-agent-process.md` (v0.1.2) and `flow.md` (v0.5.0) cover the same topic, keep the newer one
- If `04-annotation-model.md` (v0.1.2) and a newer version exist, remove the old one

**Remove example project docs** that are just READMEs of sample apps:
- Tripper (travel planner example)
- Shepherd (GitHub issue triage example)
- DICE (separate library)
- Project creator (tooling, not framework)
- Coding agent (separate project)

**Remove low-value files**:
- Maven dependency structure (links in README suffice)
- Scripts documentation (not needed for building projects)
- Examples module README (covered by main README)
- Template project READMEs (covered by getting-started docs)

### Step 4: Verify Remaining Coverage

After removal, verify the remaining files cover these essential areas:

| Area | Required? | Example Files |
|------|-----------|---------------|
| Framework overview | Yes | `01-embabel-agent-readme.md` |
| Core concepts | Yes | `core/01-overview-and-core-concepts.md` |
| Getting started | Yes | `core/02-getting-started.md` |
| Annotations/API | Yes | `reference/04-annotation-model.md` |
| Tools | Yes | `reference/05-tools-050.md` |
| Configuration | Yes | `reference/06-configuration-050.md` |
| Invocation | Yes | `reference/07-invoking-050.md` |
| Planners | Yes | `reference/08-planners-050.md` |
| Testing | Yes | `reference/09-testing-050.md` |
| Chatbots | Yes | `reference/10-chatbots-050.md` |
| Skills | Yes | `reference/03-agent-skills.md` |
| Index | Yes | `INDEX.md` |

Aim for **10-15 files** with **1,000-2,000 lines** total. This is a focused set that a coding agent can use to build projects without being overwhelmed by noise.

### Step 5: Update the INDEX

Rewrite the `INDEX.md` to reflect the distilled set:

```markdown
# <Project> Framework Documentation Index (Distilled)

Focused set of documentation resources for building projects with <Project>.
Source: <docs URL>

## Files

### <filename>.md
<One-line description of what it gives you>

### core/<filename>.md
<One-line description>

...
```

Each file description should answer: **what does a coding agent get from reading this?** Not a summary of content, but the practical value.

### Step 6: Final Verification

```bash
find raw/<project-name>-docs -type f -name "*.md" | sort
wc -l **/*.md */**/*.md 2>/dev/null | tail -1
du -sh raw/<project-name>-docs/
```

Verify:
- No empty or near-empty files remain
- No duplicate topics (same concept covered in multiple files)
- All essential areas are covered by at least one file
- Total size is reduced by at least 30-50% from the original
- File count is reduced by at least 30-40% from the original

### Key Distillation Principles

1. **Keep what enables building** — if a file helps a coding agent write code, keep it
2. **Remove what is reference-only** — if it's just listing APIs without context, remove it
3. **Keep the latest version** — never keep old versions of the same topic
4. **Keep examples inline** — if code examples are in the reference docs, you don't need separate example project READMEs
5. **One file per topic** — if two files cover the same topic, keep the more comprehensive one
6. **README stays** — the main README usually contains the best high-level overview and should always be kept
7. **Configuration matters** — config properties are essential for production projects, keep them
8. **Testing matters** — testing patterns are essential for quality, keep them

### Common Distillation Outcomes

**Before**: 25+ files, 3,000+ lines, 200K+ (raw fetch of all docs)
**After**: 10-15 files, 1,000-2,000 lines, 100-150K (distilled for building)

Typical removals:
- 5-8 example project READMEs
- 3-5 old version reference docs
- 2-4 tooling/scaffolding docs
- 1-2 low-value metadata files
