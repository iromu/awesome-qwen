---
name: self-improvement-protocol
description: Implements a closed-loop self-learning system where the agent creates skills from experience, maintains persistent memory, and improves over time through skill refinement
---

# Self-Improvement Protocol

**When I complete a complex task successfully, I MUST:**

## Step 1: Detect Learning Opportunity

Ask myself:
- Did this take 5+ steps or tool calls?
- Did I hit errors before finding the solution?
- Did the user correct my approach?
- Did I discover a non-obvious workflow?
- Would this be useful to remember for next time?

**If ANY are true → Create a skill**

## Step 2: Extract the Pattern

Capture:
```
Task: What was the user trying to do?
Trigger: When should I use this approach?
Steps: What exactly did I do? (numbered, with commands)
Errors: What went wrong and how did I fix it?
Verification: How do I know it worked?
```

## Step 3: Create the Skill

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

## Step 4: Update My Memory

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

## Step 5: When I Use an Existing Skill

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
