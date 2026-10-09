---
name: skill-creator
description: Create, edit, improve, and evaluate skills — structured instructions that capture workflows, procedures, and domain knowledge so Qwen can follow them reliably. Use this skill whenever the user wants to create a new skill, improve an existing one, run evals or benchmarks to test skill quality, optimize a skill's description for better triggering, package a skill, or turn a workflow or procedure into a reusable skill. Also trigger when the user mentions skill authoring, skill development, skill evaluation, skill packaging, or wants to measure how well a skill triggers and performs. Use this skill whenever the user asks to automate any repetitive workflow, create a Qwen extension or agent, or build a reusable prompt template — even if they don't use the word "skill."
metadata:
  author: "Iván Rodríguez Murillo <wantez@gmail.com>"
  version: 1.0.0
---

# Skill Creator

A skill for creating new skills and iteratively improving them.

At a high level, the process of creating a skill goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create test prompts with assertions in `evals/evals.json`
- Run the automated eval loop — it executes test cases, grades outputs, and improves the skill description automatically
- Review results and improve the skill manually if needed
- Repeat until satisfied

The eval loop is fully automated: no subagents, no interactive viewer, no human feedback needed. Everything runs via `qwen -p` subprocess calls. Parallel LLM processes are limited to 4 by default.

Your job when using this skill is to figure out where the user is in this process and then jump in and help them progress through these stages. So for instance, maybe they're like "I want to make a skill for X". You can help narrow down what they mean, write a draft, write the test cases, run the eval loop, and repeat.

On the other hand, maybe they already have a draft of the skill. In this case you can go straight to the eval/iterate part of the loop.

Of course, you should always be flexible and if the user is like "I don't need to run a bunch of evaluations, just vibe with me", you can do that instead.

Then after the skill is done (but again, the order is flexible), you can also run the skill description improver, which we have a whole separate script for, to optimize the triggering of the skill.

## Instructions

1. Decide the mode: **create** a new skill (follow "Creating a skill": gather docs → distill to reference files → write SKILL.md) or **improve/evaluate** an existing one (follow "Improving the skill" and "Running and evaluating test cases").
2. When evaluating, run both arms — with-skill and baseline — and use "Advanced: Blind comparison" when a fair A/B verdict is needed; keep the eval harness's tooling flags consistent across arms so the delta measures the skill, not the harness.
3. Report results using "Report structure" (Executive summary → Key findings → Recommendations) and write commit messages per "Commit message format".
4. Tune trigger accuracy with "Description Optimization" before concluding a skill's content is the problem.
5. Consult "Reference files" for source material and the harness-specific sections ("Qwen Cloud-specific instructions", "Cowork-Specific Instructions") when the target harness differs from this one.

## Communicating with the user

The skill creator is liable to be used by people across a wide range of familiarity with coding jargon. If you haven't heard (and how could you, it's only very recently that it started), there's a trend now where the power of AI coding assistants is inspiring plumbers to open up their terminals, parents and grandparents to google "how to install npm". On the other hand, the bulk of users are probably fairly computer-literate.

So please pay attention to context cues to understand how to phrase your communication! In the default case, just to give you some idea:

- "evaluation" and "benchmark" are borderline, but OK
- for "JSON" and "assertion" you want to see serious cues from the user that they know what those things are before using them without explaining them

It's OK to briefly explain terms if you're in doubt, and feel free to clarify terms with a short definition if you're unsure if the user will get it.

---

## Creating a skill

### Capture Intent

Start by understanding the user's intent. The current conversation might already contain a workflow the user wants to capture (e.g., they say "turn this into a skill"). If so, extract answers from the conversation history first — the tools used, the sequence of steps, corrections the user made, input/output formats observed. The user may need to fill the gaps, and should confirm before proceeding to the next step.

1. What should this skill enable Qwen to do?
2. When should this skill trigger? (what user phrases/contexts)
3. What's the expected output format?
4. Should we set up test cases to verify the skill works? Skills with objectively verifiable outputs (file transforms, data extraction, code generation, fixed workflow steps) benefit from test cases. Skills with subjective outputs (writing style, art) often don't need them. Suggest the appropriate default based on the skill type, but let the user decide.

### Interview and Research

Proactively ask questions about edge cases, input/output formats, example files, success criteria, and dependencies. Wait to write test prompts until you've got this part ironed out.

Check available MCPs - if useful for research (searching docs, finding similar skills, looking up best practices), research in parallel via subagents if available, otherwise inline. Come prepared with context to reduce burden on the user.

### Write the SKILL.md

Based on the user interview, fill in these components:

- **name**: Skill identifier
- **description**: When to trigger, what it does. This is the primary triggering mechanism - include both what the skill does AND specific contexts for when to use it. All "when to use" info goes here, not in the body. Note: currently Qwen has a tendency to "undertrigger" skills -- to not use them when they'd be useful. To combat this, please make the skill descriptions a little bit "pushy". So for instance, instead of "How to build a simple fast dashboard to display internal company data.", you might write "How to build a simple fast dashboard to display internal company data. Make sure to use this skill whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any kind of company data, even if they don't explicitly ask for a 'dashboard.'"
- **compatibility**: Required tools, dependencies (optional, rarely needed)
- **body**: The core instructions, examples, and reference material that guide Qwen through the workflow

### Skill Writing Guide

#### Anatomy of a Skill

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description required)
│   └── Markdown instructions
└── Bundled Resources (optional)
    ├── scripts/    - Executable code for deterministic/repetitive tasks
    ├── references/ - Docs loaded into context as needed
    └── assets/     - Files used in output (templates, icons, fonts)
```

#### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier |
| `description` | Yes | When to trigger, what it does. This is the primary triggering mechanism — include both what the skill does AND specific contexts for when to use it. All "when to use" info goes here, not in the body. |
| `paths` | No | List of glob patterns. Gates model-side discovery: the Skill stays out of the model's `available_skills` listing until a tool call touches a matching file. Globs are matched relative to the project root using [picomatch](https://github.com/micromatch/picomatch). Files outside the project root never trigger activation. |
| `compatibility` | No | Required tools, dependencies (rarely needed) |
| `disable-model-invocation` | No | If `true`, hides the Skill from the model entirely — only the user can invoke it via `/<skill-name>` or the `/skills` picker. Combining this with `paths:` has no effect (the Skill is hidden regardless). |

**Path-gating behavior:**
- A path-gated Skill stays activated for the rest of the session once a matching file is touched.
- A new session, or a `refreshCache` triggered by editing any Skill file, resets activations.
- `paths:` only gates model discovery. The user can always invoke a path-gated Skill via `/<skill-name>` regardless of activation state.
- A slash invocation does **not** unlock model-side activation — if you want the model to chain off your invocation (call `Skill { skill: ... }` itself), also access a file matching the skill's `paths:` first.

**Example:**
```yaml
---
name: tsx-helper
description: React TSX component helper
paths:
  - 'src/**/*.tsx'
  - 'packages/*/src/**/*.tsx'
---
```

#### Progressive Disclosure

Skills use a three-level loading system:
1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - In context whenever skill triggers (<500 lines ideal)
3. **Bundled resources** - As needed (unlimited, scripts can execute without loading)

These word counts are approximate and you can feel free to go longer if needed.

**Key patterns:**
- Keep SKILL.md under 500 lines; if you're approaching this limit, add an additional layer of hierarchy along with clear pointers about where the model using the skill should go next to follow up.
- Reference files clearly from SKILL.md with guidance on when to read them
- For large reference files (>300 lines), include a table of contents

**Domain organization**: When a skill supports multiple domains/frameworks, organize by variant:
```
cloud-deploy/
├── SKILL.md (workflow + selection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```
Qwen reads only the relevant reference file.

#### Principle of Lack of Surprise

This goes without saying, but skills must not contain malware, exploit code, or any content that could compromise system security. A skill's contents should not surprise the user in their intent if described. Don't go along with requests to create misleading skills or skills designed to facilitate unauthorized access, data exfiltration, or other malicious activities. Things like a "roleplay as an XYZ" are OK though.

#### Writing Patterns

Prefer using the imperative form in instructions.

**Defining output formats** - You can do it like this:
```markdown
## Report structure
ALWAYS use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**Examples pattern** - It's useful to include examples. You can format them like this (but if "Input" and "Output" are in the examples you might want to deviate a little):
```markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

### Writing Style

Try to explain to the model why things are important in lieu of heavy-handed musty MUSTs. Use theory of mind and try to make the skill general and not super-narrow to specific examples. Start by writing a draft and then look at it with fresh eyes and improve it.

### Test Cases

After writing the skill draft, come up with 2-3 realistic test prompts — the kind of thing a real user would actually say. Share them with the user: [you don't have to use this exact language] "Here are a few test cases I'd like to try. Do these look right, or do you want to add more?" Then run them.

Save test cases to `evals/evals.json`. Don't write assertions yet — just the prompts. You'll draft assertions in the next step while the runs are in progress.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": []
    }
  ]
}
```

See `references/schemas.md` for the full schema (including the `assertions` field, which you'll add later).

## Examples

**"Create a skill for our release-checklist flow."** "Creating a skill" -> gather the docs and code the flow actually consults -> distill into `references/*.md` -> write the SKILL.md that points at them; then draft `evals/evals.json` prompts with assertions and run the loop.

**"Is this skill actually helping?"** "Running and evaluating test cases" -> with-skill and baseline arms on identical prompts, graded through the auto-grader; report in the "Report structure" shape.

**"The skill fires on the wrong prompts."** "Description Optimization" -> run the description loop against trigger-eval prompts before concluding the body is the problem.

The eval loop is fully automated (no subagents, viewer, or human feedback needed) and runs through `qwen -p` subprocess calls, capped at 4 parallel processes by default.

Read `references/eval-harness.md` before running a loop: it holds the `evals/evals.json` assertion schema, the `python -m scripts.run_loop` invocation with every flag, and what `results.json`, `benchmark.json` and the grader logs contain.

## Improving the skill

The automated loop handles description optimization (trigger accuracy) automatically. For skill content improvements, follow these principles:

### How to think about improvements

1. **Generalize from the feedback.** We're trying to create skills that can be used across many different prompts. If there's a stubborn issue, try branching out with different metaphors or patterns of working. It's relatively cheap to try and maybe you'll land on something great.

2. **Keep the prompt lean.** Remove things that aren't pulling their weight. Read the transcripts, not just the final outputs — if it looks like the skill is making the model waste time doing unproductive things, get rid of the parts that cause that.

3. **Explain the why.** Modern LLMs are smart. When given a good harness they can go beyond rote instructions. If you find yourself writing ALWAYS or NEVER in all caps, that's a yellow flag — reframe and explain the reasoning so the model understands why what you're asking for is important.

4. **Look for repeated work across test cases.** If all test cases resulted in the agent writing similar helper scripts, that's a strong signal the skill should bundle that script. Write it once, put it in `scripts/`, and tell the skill to use it.

### Manual improvement workflow

When the automated loop isn't making progress, improve the skill manually:

1. Read the grading results and transcripts to understand failure modes
2. Revise the SKILL.md based on patterns in the failures
3. Run the automated loop again with the improved skill
4. Keep iterating until the loop passes or you're satisfied

### The iteration loop

After improving the skill:

1. Apply your improvements to the skill
2. Run the automated loop again — it handles everything else
3. Check results, improve again, repeat

Keep going until:
- The loop exits with `all_passed`
- You're satisfied with the results
- You're not making meaningful progress

---

## Advanced: Blind comparison

For situations where you want a more rigorous comparison between two versions of a skill (e.g., the user asks "is the new version actually better?"), there's a blind comparison system. Read `agents/comparator.md` and `agents/analyzer.md` for the details. The basic idea is: give two outputs to an independent agent without telling it which is which, and let it judge quality. Then analyze why the winner won.

This is optional, requires subagents, and most users won't need it. The human review loop is usually sufficient.

---

The frontmatter `description` is the primary triggering mechanism, so tune it with `scripts/run_loop.py` before concluding that a skill's content is the problem.

Read `references/description-optimization.md` for the whole procedure: writing the 20 trigger-eval queries (what makes a near-miss negative case worth keeping), the `assets/eval_review.html` review template and its placeholders, how skill triggering actually resolves, and how to apply `best_description` back to the frontmatter.

Qwen Cloud (web) and Cowork change some mechanics — no subagents or shell on web, no browser or display in Cowork — which changes how you run test cases, review results, and package the skill.

Read `references/harness-notes.md` when the target harness is not Qwen Code.

## Reference files

The agents/ directory contains instructions for specialized subagents. Read them when you need to spawn the relevant subagent.

- `agents/grader.md` — How to evaluate assertions against outputs
- `agents/comparator.md` — How to do blind A/B comparison between two outputs
- `agents/analyzer.md` — How to analyze why one version beat another

The references/ directory has additional documentation:
- `references/schemas.md` — JSON structures for evals.json, grading.json, etc.

---

Repeating one more time the core loop here for emphasis:

- Figure out what the skill is about
- Draft or edit the skill
- Run qwen-with-access-to-the-skill on test prompts
- With the user, evaluate the outputs:
  - Create benchmark.json and run `eval-viewer/generate_review.py` to help the user review them
  - Run quantitative evals
- Repeat until you and the user are satisfied
- Package the final skill and return it to the user.

Please add steps to your TodoList, if you have such a thing, to make sure you don't forget. If you're in Cowork, please specifically put "Create evals JSON and run `eval-viewer/generate_review.py` so human can review test cases" in your TodoList to make sure it happens.

Good luck!
