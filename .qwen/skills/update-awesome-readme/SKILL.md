---
name: update-awesome-readme
description: Procedure for updating an "awesome" list README.md to reflect the current state of its subdirectories (skills, agents, hooks, workflows, instructions, cookbook)
source: auto-skill
extracted_at: '2026-06-07T09:14:16.004Z'
---

## Procedure: Update an "Awesome" List README

When asked to update the README.md of an "awesome" list project (e.g., a curated collection of skills, agents, hooks, workflows, instructions):

### Step 1: Read the Current README

1. Read the README.md to understand its structure, sections, and table formats.
2. Identify the sections that list items (e.g., Skills, Agents, Hooks, Workflows, Instructions, Cookbook).
3. Note the table columns used (e.g., `| Skill | Description | Version | Tags |`).

### Step 2: Discover What Exists on Disk

1. **List each relevant directory** — use `list_directory` for every section's directory:
   - `agents/`, `skills/`, `hooks/`, `workflows/`, `instructions/`, `cookbook/`
2. **Identify new items** — directories that exist on disk but are not listed in the README.
3. **Identify removed items** — entries in the README whose directory no longer exists on disk.
4. **Identify consolidated/renamed items** — entries in the README whose directories have been merged or renamed (check git log for recent renames).

### Step 3: Gather Descriptions for New Items

For each new skill/directory that needs to be added:

1. **Read the SKILL.md** (or equivalent primary doc file) to get the description:
   - Skills: `skills/<name>/SKILL.md` — use the `description` field from YAML frontmatter, or the first paragraph of the body.
   - Agents: `agents/<name>.agent.md` — use the description from frontmatter.
   - Hooks: `hooks/<name>/SKILL.md` or the primary doc in the directory.
   - Workflows: `workflows/<name>.md` — use the heading or first paragraph.
   - Instructions: `instructions/<name>.instructions.md` — use the heading or first paragraph.
2. **For items without a SKILL.md** (e.g., iteration/experiment directories) — skip them; they are not proper skills.
3. **For items with frontmatter** — extract the `description` field. For items without frontmatter, use the first substantive paragraph.

### Step 4: Determine Tags and Metadata

1. **Version** — use `1.0.0` for new skills unless a version is specified in frontmatter.
2. **Tags** — generate badge-style tags from the description:
   - Extract 2-3 key concepts from the description.
   - Format: `![tag](https://img.shields.io/badge/<tag>-blue)`
   - Example: `![jvm](https://img.shields.io/badge/jvm-blue) ![spring](https://img.shields.io/badge/spring-blue)`
3. **Applies To** (for instructions) — use the glob pattern from frontmatter or infer from filename (e.g., `**/*.ts` for TypeScript).
4. **Model** (for agents) — use the model from frontmatter or infer from the agent's purpose.
5. **Trigger** (for hooks) — use the trigger event from frontmatter or infer (e.g., `SessionStart`, `PostToolUse`, `Stop`).

### Step 5: Update the README

1. **Remove obsolete entries** — delete rows for items that no longer exist on disk (e.g., consolidated skills).
2. **Add new entries** — insert rows for new items, maintaining alphabetical order within each section.
3. **Preserve formatting** — match the existing table format exactly (column widths, code blocks, badge syntax).
4. **Do NOT modify** sections that are unchanged (e.g., if only skills changed, leave agents/hooks/workflows untouched).
5. **Keep the table of contents** in sync if section headings change (rare).

### Step 6: Verify

After editing, verify:
- Every directory on disk that should be listed is in the README.
- Every README entry has a corresponding directory on disk.
- No duplicate entries exist.
- Descriptions are accurate and concise (one sentence, active voice).
- Tags match the actual technology/domain of each item.
- The file is valid Markdown (no broken links, proper table alignment).

### Key Considerations

- **Consolidated skills**: When two skills are merged into one (e.g., `self-improvement-protocol` + `self-learning-loop` → `self-learning`), remove the old entries and add the new one.
- **Iteration directories**: Directories like `iteration-1/`, `iteration-2/`, `skill-snapshot/` are experiment folders — do NOT add them as skills.
- **Alphabetical order**: Within each section, keep entries sorted alphabetically by name for easy scanning.
- **Badge consistency**: Use the same tag style across all entries (blue shields, lowercase tag names with hyphens).
- **Frontmatter extraction**: When a SKILL.md has YAML frontmatter, the `description` field is the authoritative source — prefer it over summarizing the body.
