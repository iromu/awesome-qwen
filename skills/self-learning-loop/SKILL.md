---
name: self-learning-loop
description: Implements a closed-loop self-learning system where the agent creates skills from experience, maintains persistent memory, and improves over time through trajectory compression and skill refinement
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

#### Usage
```bash
# Compress a directory of trajectory files
python trajectory_compressor.py --input=data/my_run

# Compress a single file
python trajectory_compressor.py --input=data/trajectories.jsonl

# Compress 15% sample
python trajectory_compressor.py --input=data/trajectories.jsonl --sample_percent=15
```

## Implementation Patterns

### Pattern 1: Autonomous Skill Creation After Success

```python
# After completing a complex task successfully:
def create_skill_from_experience(
    task_description: str,
    steps_taken: List[str],
    errors_encountered: List[str],
    final_solution: str,
    verification_steps: List[str]
):
    """Create a skill capturing the successful approach."""
    
    skill_content = f"""---
name: {generate_skill_name(task_description)}
description: {task_description[:100]}
version: 1.0.0
---

# {task_description.title()}

## When to Use
{generate_trigger_conditions(task_description)}

## Procedure
{format_steps(steps_taken)}

## Pitfalls
{format_pitfalls(errors_encountered)}

## Verification
{format_verification_steps(verification_steps)}
"""
    
    return skill_manage(
        action="create",
        name=generate_skill_name(task_description),
        content=skill_content,
        category=infer_category(task_description)
    )
```

### Pattern 2: Skill Self-Improvement During Use

```python
# When using a skill and discovering issues:
def improve_skill_from_usage(skill_name: str, issue_found: str, fix_applied: str):
    """Patch skill based on real-world usage."""
    
    skill_manage(
        action="patch",
        name=skill_name,
        old_string=identify_section_to_update(skill_name, issue_found),
        new_string=f"""## Pitfalls
- {issue_found}: {fix_applied}
"""
    )
```

### Pattern 3: Memory Consolidation

```python
# When memory is approaching capacity:
def consolidate_memory_entries(current_memories: List[str], new_entry: str):
    """Merge related memories to make room for new information."""
    
    # Group related entries
    related_groups = cluster_by_topic(current_memories)
    
    # Merge each group into single concise entry
    consolidated = []
    for group in related_groups:
        merged = merge_and_summarize(group)
        consolidated.append(merged)
    
    # Add new entry if room
    if can_fit(consolidated, new_entry):
        consolidated.append(new_entry)
    
    return consolidated
```

### Pattern 4: Progressive Skill Disclosure

```python
# Token-efficient skill loading:
def load_skill_progressively(skill_name: str, need_level: str):
    """
    Level 0: skills_list() → metadata only (~3k tokens)
    Level 1: skill_view(name) → full content (varies)
    Level 2: skill_view(name, path) → specific reference file (varies)
    """
    
    if need_level == "discovery":
        return skills_list()  # Just metadata
    
    elif need_level == "usage":
        return skill_view(skill_name)  # Full SKILL.md
    
    elif need_level == "reference":
        return skill_view(skill_name, "references/api-guide.md")  # Specific file
```

## Security & Validation

### Skill Security
- All agent-created skills undergo security scanning
- Checks for: data exfiltration, prompt injection, destructive commands, shell injection
- Atomic writes with rollback on security scan failure
- Skills can declare required environment variables securely

### Memory Security
- Memory entries scanned for injection/exfiltration patterns before acceptance
- Invisible Unicode characters blocked
- Content matching threat patterns rejected (prompt injection, credential exfiltration)

### Skill Validation
- Name validation: lowercase, alphanumeric, hyphens/underscores only
- Frontmatter validation: requires `name` and `description` fields
- Content size limits: 100k chars for SKILL.md, 1MiB per supporting file
- Path traversal prevention in supporting file operations

## External Memory Providers (Optional Extensions)

The system supports external memory provider plugins that run alongside built-in memory:

| Provider | Capability |
|----------|------------|
| **Honcho** | Dialectic user modeling |
| **Mem0** | Semantic memory with fact extraction |
| **Hindsight** | Cross-session learning graphs |
| **OpenViking** | Knowledge graph memory |
| **Holographic** | Vector-based semantic recall |

Only ONE external provider allowed at a time (prevents tool schema bloat).

## Example: Complete Self-Learning Workflow

### Phase 1: Initial Task Execution
```
User: "Set up a CI/CD pipeline for my Python project"
Agent: [Executes task, makes 8 tool calls, hits 2 errors, finds solution]
```

### Phase 2: Autonomous Skill Creation
```
Agent detects:
✓ Complex task (8 tool calls > 5 threshold)
✓ Successful completion
✓ Errors overcome (documented workarounds)

Agent creates skill:
skill_manage(
  action="create",
  name="python-cicd-pipeline",
  content="---
name: python-cicd-pipeline
description: Set up CI/CD for Python projects with testing and deployment
version: 1.0.0
---

# Python CI/CD Pipeline Setup

## When to Use
- Setting up automated testing for Python projects
- Deploying Python applications to production
- Configuring CI/CD with GitHub Actions

## Procedure
1. Create .github/workflows/ci.yml
2. Add test configuration...

## Pitfalls
- Python 3.12 requires updating setuptools first
- Docker builds fail without buildx on ARM...

## Verification
- Tests pass in CI
- Deployment succeeds
"
)
```

### Phase 3: Memory Update
```
Agent updates MEMORY.md:
memory(action="add", target="memory", 
       content="User's Python project at ~/projects/api uses FastAPI, pytest, Docker. 
                CI/CD via GitHub Actions. Deploy to Render.com. Python 3.12.")
```

### Phase 4: Skill Reuse & Refinement
```
User (2 weeks later): "Set up CI/CD for my new FastAPI service"
Agent: [Loads python-cicd-pipeline skill]
Agent: [Uses skill, discovers new issue with ARM64 builds]

Agent patches skill:
skill_manage(
  action="patch",
  name="python-cicd-pipeline",
  old_string="## Pitfalls\n- Python 3.12 requires updating setuptools first",
  new_string="## Pitfalls\n- Python 3.12 requires updating setuptools first\n- ARM64 builds need qemu-user-static for multi-arch support"
)
```

### Phase 5: Trajectory Compression (For Training)
```
After session ends:
python trajectory_compressor.py --input=session_data/

Result: 23-turn conversation compressed to 12 turns with summary.
Training data optimized for future fine-tuning.
```

## Key Design Principles

1. **Progressive Disclosure:** Load only what's needed, when it's needed
2. **Atomic Operations:** All writes are atomic with rollback on failure
3. **Token Efficiency:** Skills and memory optimized for minimal token usage
4. **Autonomous Operation:** Agent detects when to create/update without explicit instruction
5. **Security First:** All agent-created content scanned before persistence
6. **Capacity Management:** Strict limits force consolidation and quality over quantity
7. **Separation of Concerns:** Memory (broad/declarative) vs Skills (narrow/actionable)
8. **Continuous Improvement:** Skills self-improve based on real usage feedback
9. **Cross-Session Persistence:** Learning survives across restarts and sessions
10. **Training Data Generation:** Trajectories compressed into optimized fine-tuning datasets

## Verification

To verify the self-learning system is working:

1. **Skill Creation:** Check `~/.qwen/skills/` for new skill directories after complex tasks
2. **Memory Updates:** Verify `~/.qwen/memories/MEMORY.md` and `USER.md` are populated
3. **Skill Improvement:** Use a skill, find an issue, verify it gets patched automatically
4. **Session Search:** Query past sessions and verify relevant results returned
5. **Trajectory Compression:** Run compressor on session data and verify token reduction
6. **Security Scanning:** Verify all created skills pass security checks

## Related Skills

- memory-management: Advanced memory strategies and consolidation
- skill-creator: Guidelines for creating high-quality skills
- trajectory-analysis: Analyzing and optimizing agent interaction patterns
