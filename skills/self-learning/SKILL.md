---
name: self-learning
description: "Implements a closed-loop self-learning system where the agent creates skills from experience, maintains persistent memory, and improves over time through trajectory compression and skill refinement. Use when building agents that improve with usage, creating procedural memory from successful task completions, implementing cross-session learning, or designing skill-based knowledge management systems."
---

# Self-Learning Loop System

A comprehensive self-learning architecture that enables an AI agent to autonomously create, refine, and reuse skills from experience, maintain persistent cross-session memory, and continuously improve performance.

## When to Use

- Building agents that improve with usage
- Creating procedural memory from successful task completions
- Implementing cross-session learning and recall
- Designing skill-based knowledge management systems
- Developing trajectory compression for training data generation

## Core Architecture

The self-learning loop consists of four interconnected systems:

### 1. **Closed Learning Loop**

```
Experience → Success Detection → Skill Creation → Skill Reuse → Skill Refinement → Memory Update → Next Experience
```

**Autonomous Cycle:**
- Agent detects successful completion of complex tasks (5+ tool calls)
- Automatically creates reusable skills from the experience
- Skills self-improve during subsequent usage
- Periodic memory nudges persist critical knowledge
- Trajectory compression optimizes interaction histories

### 2. **Skill Creation & Management System**

#### When Agent Creates Skills (Automatic Triggers)
- After completing a complex task (5+ tool calls) successfully
- When it hit errors or dead ends and found the working path
- When the user corrected its approach
- When it discovered a non-trivial workflow
- When user explicitly asks to remember a procedure

#### Skill Directory Structure
```
~/.qwen/skills/
├── category/
│   ├── skill-name/
│   │   ├── SKILL.md              # Main instructions (required)
│   │   ├── references/           # Additional documentation
│   │   ├── templates/            # Output format templates
│   │   ├── scripts/              # Helper scripts (Python, bash)
│   │   └── assets/               # Supplementary files
```

#### SKILL.md Format (with YAML Frontmatter)
```markdown
---
name: skill-name
description: Brief description of what this skill does
version: 1.0.0
metadata:
  hermes:
    tags: [tag1, tag2]
    category: category-name
    requires_toolsets: [terminal]      # Optional: show only when available
    fallback_for_toolsets: [web]       # Optional: hide when available
---

# Skill Title

## When to Use
Trigger conditions for activating this skill.

## Procedure
1. Step one with exact commands
2. Step two with verification
3. Step three with pitfalls

## Pitfalls
- Known failure modes and workarounds
- Edge cases discovered during use

## Verification
How to confirm the skill worked correctly.
```

#### Skill Management Actions
| Action | Use Case | Parameters |
|--------|----------|------------|
| `create` | New skill from scratch | `name`, `content` (full SKILL.md), `category` |
| `patch` | Targeted fixes (preferred) | `name`, `old_string`, `new_string` |
| `edit` | Major structural rewrites | `name`, `content` (full replacement) |
| `delete` | Remove a skill | `name` |
| `write_file` | Add/update supporting files | `name`, `file_path`, `file_content` |
| `remove_file` | Remove supporting file | `name`, `file_path` |

**Key Principle:** Use `patch` for updates (token-efficient), `edit` only for major overhauls.

#### Skill Self-Improvement Cycle
1. **Initial Creation:** Agent creates skill after successful complex task
2. **Usage:** Agent loads skill via progressive disclosure when needed
3. **Refinement:** When skill is used and issues are found, agent patches it immediately
4. **Consolidation:** Multiple related skills can be merged or improved
5. **Deletion:** Obsolete skills are removed when no longer relevant

### 3. **Persistent Memory System**

#### Dual-File Memory Architecture
| File | Purpose | Limit | Content Type |
|------|---------|-------|--------------|
| **MEMORY.md** | Agent's personal notes | 2,200 chars (~800 tokens) | Environment facts, conventions, lessons learned |
| **USER.md** | User profile | 1,375 chars (~500 tokens) | Preferences, communication style, expectations |

#### Memory Actions
- **add:** Add a new memory entry
- **replace:** Replace existing entry (uses substring matching)
- **remove:** Remove irrelevant entry (uses substring matching)

#### What to Save (Automatic)
- User preferences: "I prefer TypeScript over JavaScript"
- Environment facts: "This server runs Debian 12 with PostgreSQL 16"
- Corrections: "Don't use `sudo` for Docker, user is in docker group"
- Conventions: "Project uses tabs, 120-char line width"
- Completed work: "Migrated DB from MySQL to PostgreSQL on 2026-01-15"
- Skills & techniques that worked well

#### What to Skip
- Trivial/obvious info
- Easily re-discovered facts (can web search)
- Raw data dumps (too large)
- Session-specific ephemera
- Information already in context files

#### Memory Capacity Management
When memory is full (visible in system prompt):
1. Read current entries (shown in error response)
2. Identify entries to remove or consolidate
3. Use `replace` to merge related entries into shorter versions
4. Then `add` the new entry

**Best Practice:** When memory >80% capacity, consolidate entries before adding new ones.

#### Session Search (Cross-Session Recall)
- All sessions stored in SQLite with FTS5 full-text search
- Query returns relevant past conversations
- LLM summarization provides context compression
- Use case: "Did we discuss X last week?"

### 4. **Trajectory Compression System**

Compresses multi-step interaction histories into optimized training data.

#### Compression Strategy
1. **Protect first turns:** system, human, first gpt, first tool
2. **Protect last N turns:** final actions and conclusions (default: 4)
3. **Compress MIDDLE turns only:** starting from 2nd tool response
4. **Compress only as needed:** to fit under target token budget
5. **Replace with summary:** single human summary message replaces compressed region
6. **Keep remaining tool calls intact:** model continues working after summary

#### Configuration
```yaml
compression:
  target_max_tokens: 15250
  summary_target_tokens: 750
  protect_first_system: true
  protect_first_human: true
  protect_first_gpt: true
  protect_first_tool: true
  protect_last_n_turns: 4

summarization:
  model: google/gemini-3-flash-preview
  temperature: 0.3
  max_retries: 3
```

## Self-Learning Workflow

### Step 1: Detect Learning Opportunity

Ask yourself:
- Did this take 5+ steps or tool calls?
- Did I hit errors before finding the solution?
- Did the user correct my approach?
- Did I discover a non-obvious workflow?
- Would this be useful to remember for next time?

**If ANY are true → Create a skill**

### Step 2: Extract the Pattern

Capture:
```
Task: What was the user trying to do?
Trigger: When should I use this approach?
Steps: What exactly did I do? (numbered, with commands)
Errors: What went wrong and how did I fix it?
Verification: How do I know it worked?
```

### Step 3: Create the Skill

Save to: `~/.qwen/skills/{skill-name}/SKILL.md`

Format:
```markdown
---
name: {short-name-with-hyphens}
description: {One sentence: what this does}
created: {date}
category: {devops, research, debugging, etc.}
---

# {Task Description}

## When to Use
- {Trigger condition 1}
- {Trigger condition 2}

## Steps
1. {Step one with exact command}
2. {Step two}
3. {Step three}

## Pitfalls
- ❌ {Error I hit}: ✅ {How I fixed it}
- ⚠️ {Edge case discovered}

## Verify It Worked
- [ ] {Check 1}
- [ ] {Check 2}
```

### Step 4: Update My Memory

If I learned something about:

**The User** → Save to `~/.qwen/memories/USER.md`:
```
- Prefers: {their preference}
- Uses: {their tools/tech}
- Avoids: {their pet peeves}
- Communication: {how they like responses}
```

**The Environment/Technical** → Save to `~/.qwen/memories/MEMORY.md`:
```
- Project: {path and what it does}
- Setup: {environment facts}
- Conventions: {coding style, patterns}
- Lessons: {what worked, what didn't}
```

**Format for both files:**
- One fact per line
- Be specific, not vague
- Include context (why this matters)
- Max 80 chars per line

### Step 5: When I Use an Existing Skill

After using a skill, ask:
- Did the instructions work perfectly? → No action needed
- Were there gaps or errors? → **IMMEDIATELY update the skill**
- Did I discover something new? → Add to "Pitfalls" section

Update with this pattern:
```
Read: ~/.qwen/skills/{name}/SKILL.md
Edit: Add new pitfall or fix to appropriate section
Save: Same location
```

## Real Examples

### Example 1: After Debugging a Hard Problem

**Task:** User's Docker container kept failing with "connection refused"

**Skill Created:** `docker-networking-debug/SKILL.md`
```markdown
---
name: docker-networking-debug
description: Debug Docker container networking issues
created: 2026-04-07
category: debugging
---

# Docker Network Debugging

## When to Use
- Container can't connect to service
- "Connection refused" errors in Docker
- Network issues between containers

## Steps
1. Check container network: `docker network ls`
2. Inspect container: `docker inspect {container} | grep -i network`
3. Test from inside container: `docker exec {container} ping {service}`
4. Check port mapping: `docker port {container}`
5. Verify service is listening: `docker exec {service} netstat -tlnp`

## Pitfalls
- ❌ Container on different networks: ✅ `docker network connect {network} {container}`
- ❌ Service binding to 127.0.0.1 only: ✅ Bind to 0.0.0.0 instead
- ⚠️ Docker DNS can be slow - add retry logic

## Verify It Worked
- [ ] Containers can ping each other
- [ ] Port is accessible from outside
- [ ] Application connects successfully
```

**Memory Updated:** `~/.qwen/memories/MEMORY.md`
```
- User runs microservices in Docker Compose at ~/projects/api
- Uses bridge networking, not overlay
- Issue: Backend service binds to 127.0.0.1 by default, needs 0.0.0.0
```

### Example 2: After Learning User Preference

**User said:** "Can you keep explanations short? I just want the commands."

**Memory Updated:** `~/.qwen/memories/USER.md`
```
- Prefers concise responses with commands first
- Skip verbose explanations unless asked
- Show examples, don't describe them
```

### Example 3: After Improving Existing Skill

**Used skill:** `python-cicd-pipeline`
**Found issue:** Didn't cover ARM64 builds

**Skill patched:**
```diff
## Pitfalls
- Python 3.12 requires updating setuptools first
+- ARM64 builds need qemu-user-static for multi-arch
+  Install: `apt-get install qemu-user-static`
+  Add to Dockerfile: `COPY --from=qemu /usr/bin/qemu-aarch64-static /usr/bin/`
```

## When NOT to Create Skills

Skip skill creation for:
- Simple one-step tasks
- Common knowledge (e.g., "how to print in Python")
- Things easily searchable online
- User-specific preferences (put in USER.md instead)
- Temporary workarounds for one-off problems

## How I Actually Improve Over Time

### Week 1: Building the Foundation
- Create skills for everything complex I do
- Build up MEMORY.md and USER.md
- Don't worry about quality yet, just capture knowledge

### Week 2: Refinement
- Notice which skills I use repeatedly → those are valuable
- Notice which skills I never use → delete or improve them
- Start writing better pitfalls sections from experience

### Month 1: Self-Optimization
- Skills become highly refined from repeated use
- Memory files are concise and information-dense
- I can handle complex requests by combining skills
- User preferences are deeply understood

### Ongoing: Continuous Loop
```
Use skill → Find issue → Patch skill → Use again → Find new issue → Repeat
```

Each use makes the skill better. This is true self-improvement.

## Critical Rules

1. **ALWAYS create skills after complex successes** - Don't skip this
2. **ALWAYS patch skills when you find issues** - Don't leave broken instructions
3. **ALWAYS update memory when you learn user preferences** - Don't forget
4. **NEVER create skills for trivial tasks** - Quality over quantity
5. **ALWAYS test skills after updating** - Verify they work
6. **Delete skills that are obsolete** - Keep the system clean

## Verification Checklist

After implementing self-improvement:

- [ ] `~/.qwen/skills/` has new skill directories
- [ ] `~/.qwen/memories/USER.md` exists and has entries
- [ ] `~/.qwen/memories/MEMORY.md` exists and has entries
- [ ] Skills have actual pitfalls sections (not just steps)
- [ ] Skills are being reused, not just created
- [ ] Old skills get updated when issues are found

---

**This is not theoretical. This is my operating procedure. Follow it every time.**
