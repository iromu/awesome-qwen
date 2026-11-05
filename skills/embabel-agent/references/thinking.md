# Thinking (Reasoning) Reference

Extract LLM reasoning/thinking blocks alongside structured results. See SKILL.md for the core workflow.

## Motivation

Sometimes you need to validate an LLM's reasoning process in addition to obtaining a structured result. Thinking blocks help you:

- Verify the LLM adhered to constraints (e.g., dates within requested months, destinations in specified countries)
- Understand why the LLM made certain choices
- Diagnose what went wrong when the LLM cannot produce a valid object

## Core Types

| Type | Description |
|------|-------------|
| `ThinkingBlock` | Carries reasoning details: tag type, tag value, reasoning text, and origin |
| `ThinkingTagType` | Enum: `TAG` (XML-style `think`), `PREFIX` (line prefix `//THINKING:`), `NO_PREFIX` (untagged text before JSON) |
| `ThinkingOrigin` | Enum (v1.5.4): how a block was produced — `PROMPT_EXTRACTED` (Embabel parsed reasoning text from the model's prompt response) or `NATIVE` (the provider surfaced reasoning via its API, e.g. Anthropic adaptive thinking blocks) |
| `ThinkingResponse<T>` | Wrapper holding the result object and a list of `ThinkingBlock` instances |
| `ThinkingException` | Preserves thinking blocks when object instantiation fails |

## Using Thinking Mode

Call `.thinking()` on the `PromptRunner` before creating an object. This enables thinking extraction for any LLM that supports reasoning modes (e.g., Claude).

```java
PromptRunner runner = ai.withDefaultLlm()
    .withToolObject(Tooling.class);

String prompt = """
    What is the hottest month in Florida and its average high temperature?
    Please provide a detailed analysis of your reasoning.
    """;

ThinkingResponse<MonthItem> response = runner
    .thinking()
    .createObject(prompt, MonthItem.class);
```

### Graceful Failure Handling

Use `createObjectIfPossible` when the LLM might not be able to produce a valid result — the thinking blocks explain what went wrong:

```java
ThinkingResponse<MonthItem> response = runner
    .thinking()
    .createObjectIfPossible(prompt, MonthItem.class);

MonthItem result = response.getResult();
if (result != null) {
    // Process the result normally
} else {
    // Object creation failed — examine the reasoning to understand why
    for (ThinkingBlock block : response.getThinkingBlocks()) {
        logger.info("LLM reasoning: {}", block.getContent());
    }
}
```

## Extracting Thinking Output

Access thinking blocks from the `ThinkingResponse` wrapper. Each block carries its tag type, tag value, and content:

```java
List<ThinkingBlock> thinkingBlocks = response.getThinkingBlocks();

for (ThinkingBlock block : thinkingBlocks) {
    System.out.println("Type: " + block.getTagType());   // TAG, PREFIX, or NO_PREFIX
    System.out.println("Tag: " + block.getTagValue());   // e.g., "think", "analysis"
    System.out.println("Content: " + block.getContent());
}
```

## Thinking Tag Control

Without changing your prompt, control which XML-tagged reasoning blocks the model produces and returns:

- `includedTags` — keep only blocks wrapped in the named tags; the model is automatically instructed (via a system prompt hint) to use those tags for its reasoning
- `excludedTags` — drop blocks with specific tag names while keeping all others

Only named TAG blocks are affected. Untagged reasoning (PREFIX and NO_PREFIX style blocks) always passes through.

```java
// Only return the "analysis" reasoning block; model is guided to use that tag
ThinkingResponse<MonthItem> response = runner
        .thinking(Thinking.withIncludedTags("analysis"))
        .createObject(prompt, MonthItem.class);

// Drop "scratchpad" blocks, keep all others
ThinkingResponse<MonthItem> response2 = runner
        .thinking(Thinking.withExcludedTags("scratchpad"))
        .createObject(prompt, MonthItem.class);
```

```kotlin
val response = runner
        .thinking(Thinking.withIncludedTags("analysis"))
        .createObject(prompt, MonthItem::class.java)
```

## Native Thinking (Anthropic Adaptive Models, v1.5.4)

Claude 5.x models (`claude-sonnet-5-5`, `claude-opus-5-5`, `claude-haiku-5-5`, `claude-fable-5-1`)
and Claude ≥4.7 models (`claude-opus-4-8`) use Anthropic's adaptive thinking API. When a token budget
is supplied, the model decides internally when and how much to think; the reasoning is returned as a
summarized block alongside the answer, marked `ThinkingOrigin.NATIVE`.

To enable native thinking, pass a token budget via `Thinking.withTokenBudget(n)`:

```java
PromptRunner runner = ai.withLlm(
        LlmOptions.withModel("claude-sonnet-5-5")
                  .withThinking(Thinking.withTokenBudget(16000)));

ThinkingResponse<MonthItem> response = runner
        .thinking()
        .createObject(prompt, MonthItem.class);

response.getThinkingBlocks().stream()
        .filter(b -> b.getOrigin() == ThinkingOrigin.NATIVE)
        .forEach(b -> logger.info("Native reasoning: {}", b.getContent()));
```

> The returned reasoning is a **summarized** representation produced by a secondary model pass. The
> full chain of thought is encrypted in an opaque signature field and is not accessible to callers.

> **Warning:** On adaptive models (Claude ≥4.7) with an active thinking budget, choose **one** of
> native thinking **or** prompt-extracted reasoning — not both. Including XML reasoning tags in your
> prompt while a thinking budget is active causes Anthropic's API to return a `reasoning_extraction`
> refusal. Use native thinking (no tags) or prompt-extracted tags (no budget).

On adaptive models the token budget is mapped to an effort level rather than used as a hard cap:

| Budget (tokens) | Effort level |
|-----------------|--------------|
| < 1,024 | `LOW` |
| < 4,096 | `MEDIUM` |
| < 16,384 | `HIGH` |
| < 32,768 | `XHIGH` |
| ≥ 32,768 | `MAX` |

With `HIGH` effort (4,096–16,383), the model may skip thinking on tool-result turns in a multi-step
tool loop — use at least 16,384 (`XHIGH`) when reasoning across all iterations matters.

Known limitations:

- **Multi-turn (`respond()` API):** re-sending a prior assistant turn that contained thinking blocks
  drops the thinking content and signatures. Anthropic's API requires thinking blocks (including
  their encrypted signatures) to be passed back intact. Avoid combining an active thinking budget
  with `respond()` multi-turn flows.
- **Streaming:** native thinking SSE events are not yet extracted from the streaming path; thinking
  blocks are only available from blocking (`createObject`) calls.

## Provider Notes

Embabel exposes thinking through a provider-neutral API (`PromptRunner.thinking()` /
`LlmOptions.thinking`). Provider integrations translate `Thinking` to match provider-specific
capabilities; no provider-specific configuration is required at the application level.

- **Anthropic** — native adaptive thinking fully supported for Claude ≥4.7 (see above).
- **OpenAI** — reasoning tokens (`reasoningContent`) from o-series models (o1, o3, o4-mini, etc.)
  are not yet extracted; thinking blocks will be empty even when the model reasons internally.
- **Ollama** — Embabel's auto-configured Ollama LLM services set `thinkingSupported = true`, so
  thinking requests are sent correctly, but the response `thinking` field is not yet extracted.
- **Google GenAI** — thinking extraction is partially supported via Spring AI
  (`includeThoughts`, `thinkingBudget`); behavior may vary by model and integration version.

Some providers expose reasoning on the assistant message itself; others through generation metadata.
As a result, the presence and shape of extracted thinking blocks may vary by provider and Spring AI
integration version.
---

*Source: Embabel Agent v1.5.4 documentation — `references/thinking`*
