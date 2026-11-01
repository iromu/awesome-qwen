---
name: ai-meta-comment-review
description: Proofread AI-generated text for conversational meta-comments — first-person AI voice, references to the user's prompt, and presentational phrases that don't belong in standalone documentation. Use when reviewing any AI-generated document, report, or code comment for publication quality.
---

# AI Meta-Comment Review

Detect and remove conversational artifacts that leak from the AI generation process into the output text. These are phrases where the AI is still "talking to" the user rather than writing a standalone document.

## Categories

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

## Detection approach

Run targeted greps, then read the prose manually. Code and YAML blocks are excluded — only scan prose.

### Grep patterns (in order)

1. **First-person singular**:
   ```
   \b(I've|I was|I found|I discovered|I researched|I investigated|I looked|I checked|I verified|I confirmed|I noticed|I realized|I concluded|I determined|I established|I validated|I inspected|I read|I searched|I figured|I want to|I'd like to|I can|I will|I'm going to|I should|I think|I believe|I recommend|I suggest|I would|I need to)\b
   ```

2. **Presentational / conversational**:
   ```
   (Here's|Here is a|Let me|Let's|I was able to|I was not able to|I could|I couldn't|I don't have|I do not have)
   ```

3. **Second-person conversational**:
   ```
   (you asked|your instinct|you wanted|you need to|you should|you might want|you'll|you're|would you like|feel free to|don't forget|keep in mind|by the way|just so you know)
   ```

4. **Meta-commentary labels**:
   ```
   (Note:|Note that|Interesting:|Important:|Tip:|Warning:|Caveat:|The point is:|What this means:|What we found:|What we discovered:|The bottom line:|The takeaway:|Key takeaway:|In conclusion|In summary|To summarize|To sum up|In other words|In short|To wrap up|In closing)
   ```

5. **AI self-identification**:
   ```
   (As an AI|As a language model|I'm an AI|I am an AI|I was trained|I was designed|I don't have access|I do not have access|I cannot|I can't|I'm unable|I am unable|Unfortunately|I apologize|I'm sorry|My apologies|That's a great question|Good question|I see|I understand|Got it|Makes sense)
   ```

### Manual pass

After greps, read the prose (skipping code blocks, YAML, and diagrams) and check for:

- Conversational register that doesn't match the document's formal tone
- Phrases that only make sense in the context of a conversation ("as mentioned", "as we discussed", "as noted above")
- Sudden shifts between formal documentation voice and casual AI-assistant voice

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

## Report format

When reporting findings, categorize each hit:

1. **Clear** — must fix, breaks standalone reading
2. **Borderline** — fix if the doc is meant to be read without the conversation context
3. **False positive** — technical term, code identifier, or acceptable usage

Include the file, line number, the matching phrase, and the suggested replacement.
