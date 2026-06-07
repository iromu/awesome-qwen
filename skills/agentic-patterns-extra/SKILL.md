---
name: agentic-patterns-extra
description: >-
  Curated catalogue of 100+ agentic AI patterns — real-world tricks, workflows,
  and mini-architectures that help autonomous or semi-autonomous AI agents get
  useful work done in production. Use this skill whenever the user asks about
  agent architecture, agent design patterns, how to solve an agent-related
  challenge, or wants recommendations for patterns. Trigger on questions about
  context management, multi-agent coordination, reliability, security, tool use,
  feedback loops, or human-agent collaboration. Also trigger when the user wants
  to compare patterns, find the right pattern for a use case, or understand
  trade-offs between different agent approaches.
---

# Agentic Patterns Extra

A curated catalogue of agentic AI patterns sourced from [nibzard/awesome-agentic-patterns](https://github.com/nibzard/awesome-agentic-patterns), backed by public references (blog posts, talks, repos, papers).

> **Why?** Tutorials show toy demos. Real products hide the messy bits. This catalogue surfaces the repeatable patterns that bridge the gap so you can ship smarter, faster agents.

## What counts as a pattern

- **Repeatable** — more than one team is using it.
- **Agent-centric** — improves how an AI agent senses, reasons, or acts.
- **Traceable** — backed by a public reference.

## Pattern catalog

### Context & Memory

Patterns for managing agent context, working memory, and state persistence.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Working Memory via TodoWrite](reference/context-memory/working-memory-via-todos.md) | emerging | Externalize working memory with explicit task tracking and dependency management |
| [Context-Minimization Pattern](reference/context-memory/context-minimization-pattern.md) | emerging | Purge untrusted segments from context to prevent delayed prompt injection |
| [Context Window Anxiety Management](reference/context-memory/context-window-anxiety-management.md) | emerging | Mitigate models that rush task completion due to context window awareness |
| [Context Window Auto-Compaction](reference/context-memory/context-window-auto-compaction.md) | validated-in-production | Automatic session compaction on overflow with reserve tokens and lane-aware retry |

### Feedback Loops

Patterns for self-improvement, evaluation, and iterative refinement.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Reflection Loop](reference/feedback-loops/reflection.md) | established | Self-evaluate output, feed critique into revision — repeat until threshold met |
| [Rich Feedback Loops > Perfect Prompts](reference/feedback-loops/rich-feedback-loops.md) | validated-in-production | Invest in iterative machine-readable feedback infrastructure over prompt perfection |
| [Graph of Thoughts (GoT)](reference/feedback-loops/graph-of-thoughts.md) | emerging | Represent reasoning as a graph with branching, aggregation, and refinement |

### Orchestration & Control

Patterns for task decomposition, multi-agent coordination, and workflow management.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Sub-Agent Spawning](reference/orchestration-control/sub-agent-spawning.md) | validated-in-production | Spawn focused sub-agents with isolated contexts for parallel execution |
| [Swarm Migration Pattern](reference/orchestration-control/swarm-migration-pattern.md) | validated-in-production | 10+ parallel sub-agents for large-scale code migrations (10x+ speedup) |
| [Factory over Assistant](reference/orchestration-control/factory-over-assistant.md) | validated-in-production | Spawn multiple autonomous agents in parallel instead of watching one in a sidebar |
| [Tree-of-Thought Reasoning](reference/orchestration-control/tree-of-thought-reasoning.md) | established | Explore a search tree of intermediate thoughts with branching and pruning |
| [Dual LLM Pattern](reference/orchestration-control/dual-llm-pattern.md) | emerging | Split privileged and quarantined LLM roles for clear trust boundaries |
| [Budget-Aware Model Routing](reference/orchestration-control/budget-aware-model-routing.md) | established | Route requests to tiered models with explicit budget contracts and hard caps |
| [Discrete Phase Separation](reference/orchestration-control/discrete-phase-separation.md) | emerging | Isolate research, planning, and execution into separate conversations |
| [Capability-Escrow-Receipt](reference/orchestration-control/capability-escrow-receipt.md) | experimental-but-awesome | Atomic three-object loop for agent-to-agent commerce (capability, escrow, receipt) |

### Reliability & Eval

Patterns for ensuring agent reliability, evaluation, and fault tolerance.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Agent Circuit Breaker](reference/reliability-eval/agent-circuit-breaker.md) | emerging | Prevent token waste on repeatedly failing tools using a circuit breaker state machine |
| [Structured Output Specification](reference/reliability-eval/structured-output-specification.md) | established | Constrain outputs using deterministic schemas for reliable validation |
| [Output Verification Loop](reference/reliability-eval/output-verification-loop.md) | emerging | Verify outputs against expected structure before accepting results |

### Security & Safety

Patterns for securing agent systems, protecting data, and ensuring safe operation.

| Pattern | Status | Description |
|---------|--------|-------------|
| [PII Tokenization](reference/security-safety/pii-tokenization.md) | established | Tokenize PII before it reaches the model, untokenize for tool calls |
| [Hook-Based Safety Guard Rails](reference/security-safety/hook-based-safety-guard-rails.md) | emerging | Enforce safety constraints by intercepting agent actions before execution |

### Tool Use & Environment

Patterns for tool discovery, execution, and environment management.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Tool Use Steering via Prompting](reference/tool-use-environment/tool-use-steering-via-prompting.md) | best-practice | Guide agent tool selection through explicit natural language instructions |
| [Code-Then-Execute Pattern](reference/tool-use-environment/code-then-execute.md) | best-practice | Generate code first, then execute — never execute without generating code first |

### UX & Collaboration

Patterns for human-agent collaboration, handoffs, and workflow design.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Human-in-the-Loop Approval Framework](reference/ux-collaboration/human-in-loop-approval-framework.md) | validated-in-production | Insert human approval gates for high-risk operations while maintaining autonomy |
| [Agent-Friendly Workflow Design](reference/ux-collaboration/agent-friendly-workflow-design.md) | best-practice | Design workflows aligned with agent strengths — clear goals, appropriate autonomy |

## How to use this skill

When the user asks about agentic patterns, agent architecture, or how to solve a specific agent-related challenge:

1. **Identify the problem domain** — context management, reliability, security, orchestration, tool use, feedback, or human collaboration.
2. **Match to relevant patterns** — read the pattern files in `reference/` for detailed guidance.
3. **Consider trade-offs** — every pattern has pros and cons; present them honestly.
4. **Suggest combinations** — patterns often work best when combined (e.g., Structured Output + Reflection Loop).
5. **Check evidence level** — note which patterns are `validated-in-production` vs `emerging` vs `experimental`.

## Pattern metadata

Each reference file includes:

- **title** — Pattern name
- **status** — Maturity: `best-practice`, `validated-in-production`, `established`, `emerging`, `experimental-but-awesome`
- **authors** — Contributors and originators
- **source** — Primary reference URL
- **tags** — Searchable keywords
- **Problem** — What challenge does it solve?
- **Solution** — How does it solve it?
- **How to use it** — Practical implementation guidance
- **Trade-offs** — Pros and cons
- **References** — Additional resources

## External resources

- **Website**: [https://agentic-patterns.com](https://agentic-patterns.com) — Interactive pattern explorer, compare tool, decision guide, graph visualization
- **llms.txt**: [https://agentic-patterns.com/llms.txt](https://agentic-patterns.com/llms.txt) — Machine-readable documentation for AI assistants
- **GitHub**: [nibzard/awesome-agentic-patterns](https://github.com/nibzard/awesome-agentic-patterns) — Full source with 100+ patterns
