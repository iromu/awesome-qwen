---
name: ai-meta-comment-review
description: Proofread AI-generated text for conversational meta-comments — first-person AI voice, references to the user's prompt, and presentational phrases that don't belong in standalone documentation. Use when reviewing, proofreading, or cleaning up AI-generated docs, reports, READMEs, or comments; to remove conversational artifacts or "AI smell"; or to check whether a document reads as a standalone piece rather than a chat reply.
metadata:
  author: "Iván Rodríguez Murillo <wantez@gmail.com>"
  version: 1.0.0
  category: documentation
  tags: [meta-comments, proofreading, ai-generated-text, documentation, review]
---

# AI Meta-Comment Review

Detect and remove conversational artifacts that leak from the AI generation process into the output. These are phrases where the AI is still "talking to" the user rather than writing a standalone document. The goal is text that reads as if a human author wrote it directly, with no trace of the conversation that produced it.

## Purpose

Give a document a publication-quality pass for conversational voice: find the meta-comments, sort them into must-fix / fix-if-standalone / leave-alone, and hand back a report (or a cleaned rewrite) the author can act on directly.

## When to use

- Reviewing any AI-generated document, report, README, or code comment for publication quality.
- Asked to "clean up", "proofread", "de-AI", or "make this sound like a human wrote it".
- Checking whether a doc reads as a standalone piece instead of a chat reply.

## When NOT to use

- The target is *meant* to be conversational (chat transcripts, onboarding messages, a reply the reader expects to be addressed to them). Meta-comments are correct there.
- Proofreading for grammar, spelling, or factual accuracy — those are different jobs; this skill only targets conversational voice.
- The user wants the document rewritten from scratch, not a meta-comment audit.

## Categories

Judge every candidate against these three buckets. The script (below) finds candidates but cannot make this call — that is your job.

### Clear meta-comments (always fix)

The text references the conversation that produced it:

- **Prompt references**: "you asked about", "you wanted", "as you requested", "per your question"
- **First-person AI voice**: "I've researched", "I investigated", "I found that", "I verified", "I checked", "I inspected", "I discovered", "I concluded", "I determined"
- **Presentational hand-off**: "Here's a list of…", "Here's what I found:", "Here's the code:", "Let me walk you through"
- **Offering further help**: "Let me know if…", "Feel free to…", "I'd be happy to…", "I can also…"
- **Conversational emphasis**: "I'd like to point out", "I want to draw your attention to", "It's worth noting that", "Just so you know"

### Borderline (fix if the doc must stand alone)

Conversational register that may be acceptable in a commissioned doc but breaks standalone reading:

- **User-preference acknowledgment**: "Your instinct", "Your approach", "The way you framed it"
- **Forward-looking second person**: "You'll have…", "You can now…", "You'll be able to…"
- **Presentational transitions**: "Here's the wiring:", "Here's how it works:", "Here's what happens next:"
- **Informal register**: "The honest caveats", "The real deal", "The bottom line"

### Fine (leave alone)

- **Methodology statements**: "Every claim below was verified against source" — describes the research process, not a conversation
- **Descriptive imperatives**: "you need proactive maintenance" — technical guidance, not conversation
- **Technical acronyms**: "I/O" in package names, "I/O types" in type names
- **Code/YAML identifiers**: `name`, `model`, `my-agent`, `my-model` in examples
- **Generic "the user"**: describing a user's mental model or workflow, not addressing the reader
- **Standard doc labels**: "Note:", "Tip:", "Warning:", "Caveat:" — conventional headings, not meta-comments

## Available Scripts

| Script | Purpose | Arguments |
|---|---|---|
| `scripts/scan_meta_comments.py` | Strip code blocks, run the pattern set, and print `file:line [category] "phrase"` candidates with a per-category summary | `FILE...` or `-` for stdin; `--json` for machine output; `--include-code` to skip code stripping |

Runs on Python 3 with the standard library only — no third-party packages, no network. A missing input file is an error (exit code 2); anything else exits 0. Resolve the script path relative to this skill's base directory.

## Instructions

Two steps: find candidates mechanically, then judge each one. Code and YAML blocks are excluded — only prose is scanned.

### Step 1 — find candidates with the bundled script

```
python scripts/scan_meta_comments.py <file>          # human report
python scripts/scan_meta_comments.py --json <file>   # machine-readable
```

The script strips fenced code blocks and inline code so identifiers like `my-agent` never match, then reports candidates grouped by category (`first-person-voice`, `presentational`, `second-person`, `meta-labels`, `ai-self-id`). Treat its output as a **candidate list, not a verdict** — it is deliberately broad so you don't miss anything, and it will over-flag.

If you cannot run the script (no shell), fall back to targeted greps over the same phrases, still skipping code and YAML blocks.

### Step 2 — judge each candidate

For every candidate, assign one of:

1. **Clear** — must fix; breaks standalone reading.
2. **Borderline** — fix if the doc is meant to be read without the conversation context.
3. **False positive** — technical term, code identifier, standard label, or acceptable usage; leave it.

### Step 3 — manual prose pass

Greps catch the obvious. Then read the prose (skipping code, YAML, and diagrams) for what patterns miss:

- Conversational register that doesn't match the document's formal tone.
- Phrases that only make sense in a conversation: "as mentioned", "as we discussed", "as noted above", "as you can see".
- Sudden shifts between a formal documentation voice and a casual AI-assistant voice.

## Examples

**Input (a sentence from a generated doc):**
> I've researched the caching options and found that Redis fits. Here's the wiring: you'll have a cache with a 300s TTL. Let me know if you want write-through.

**Output (categorized report):**
> - **Clear** — "I've researched … found" (first-person AI voice) → "Redis fits our caching needs."
> - **Borderline** — "Here's the wiring:" (presentational hand-off) → "Wiring:" or delete.
> - **Borderline** — "you'll have a cache" (forward-looking second person) → "The cache uses a 300s TTL."
> - **Clear** — "Let me know if you want write-through." (offer of further help) → delete.

## Fix patterns

| Before | After |
|---|---|
| "Your instinct — X — is now the dominant direction" | "The approach of X is now the dominant direction" |
| "This is the layer you asked about" | "This layer is where the literature concentrates" |
| "here's the wiring:" | "the wiring:" |
| "You'll have a X that does Y" | "The result is a X that does Y" |
| "I've researched and found that X" | "Research shows that X" |
| "Let me explain how X works" | "How X works:" |
| "Here's a list of the variables you didn't account for:" | "The following variables are not covered:" |
| "Would you like me to summarize this?" | *(delete — no replacement needed)* |
| "I'd like to point out that X" | *(state X directly, or "X is worth noting")* |
| "Feel free to reach out if…" | *(delete)* |

Prefer stating the fact directly over a hedged rephrase. When a sentence exists only to offer more help, delete it outright — there is no neutral equivalent.

## Limitations

- The script finds **candidates only**; the clear/borderline/false-positive judgment is always yours. It over-flags by design.
- Patterns are English-centric. Non-English prose needs the manual pass (Step 3) to do the real work.
- Code-block stripping is a fence heuristic (``` / ~~~ and inline backticks). Unfenced code or YAML written as prose can still match; the manual pass catches those.
- "Borderline" is a judgment call about the document's audience, not a rule — the same phrase is fine in a commissioned doc and wrong in a public one.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Script prints "No meta-comment candidates found" on a doc that clearly has some | Every candidate sits inside a code block, or the prose is non-English | Re-run with `--include-code` to confirm; rely on the manual pass (Step 3) for non-English prose |
| The report is full of hits that are all false positives | The pattern set is deliberately broad — it is a candidate-finder, not a verdict | Apply the Clear/Borderline/False-positive judgment (Step 2) rather than removing patterns |
| A hit you expect is missing | It is in an unfenced code block or YAML written as prose, or uses a phrase the patterns don't cover | Read that region manually; the script is a net, not a guarantee |
| `error: not a file: <path>` (exit 2) | The path is wrong or the file is not readable | Check the path; the script reads only local files or stdin (`-`) |

## Report format

Categorize each finding and give the reader everything needed to act. For every hit include the file, line number, the matching phrase, the category (Clear / Borderline / False positive), and a suggested replacement (or "delete" where none fits). Group by category, Clear first. If a document is clean, say so explicitly rather than returning an empty list.
