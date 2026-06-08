---
name: agentic-patterns-extra
description: >-
  Curated catalogue of 180+ agentic AI patterns across 8 categories — real-world
  tricks, workflows, and mini-architectures that help autonomous or semi-autonomous
  AI agents get useful work done in production. Use this skill whenever the user
  asks about agent architecture, agent design patterns, how to solve an agent-related
  challenge, or wants recommendations for patterns. Trigger on questions about
  context management, multi-agent coordination, reliability, security, tool use,
  feedback loops, learning & adaptation, or human-agent collaboration. Also
  trigger when the user wants to compare patterns, find the right pattern for a
  use case, understand trade-offs between different agent approaches, or wants
  to know which patterns work best together. Don't hesitate to suggest patterns
  even when the user doesn't explicitly mention "patterns" — if they describe an
  agent problem, this skill likely applies. Also trigger when the user asks about
  agent failures, token waste, context contamination, or any operational issue
  with autonomous agents.
---

# Agentic Patterns Extra

A curated catalogue of agentic AI patterns sourced from [nibzard/awesome-agentic-patterns](https://github.com/nibzard/awesome-agentic-patterns), backed by public references (blog posts, talks, repos, papers).

> **Why?** Tutorials show toy demos. Real products hide the messy bits. This catalogue surfaces the repeatable patterns that bridge the gap so you can ship smarter, faster agents.

> **Reference files:** Detailed guidance for each pattern is in `reference/<category>/<pattern>.md`. When recommending a pattern, read its reference file for the complete picture (implementation, trade-offs, when NOT to use). The catalog tables above are a quick index — the reference files are the deep dive.

## What counts as a pattern

- **Repeatable** — more than one team is using it.
- **Agent-centric** — improves how an AI agent senses, reasons, or acts.
- **Traceable** — backed by a public reference.

## Pattern catalog

### Context & Memory

Patterns for managing agent context, working memory, state persistence, and knowledge retrieval.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Agent-Powered Codebase Q&A / Onboarding](reference/context-memory/agent-powered-codebase-qa-onboarding.md) | validated-in-production | Leverage AI agent with retrieval and QA capabilities to assist developers understanding codebases |
| [Context-Minimization Pattern](reference/context-memory/context-minimization-pattern.md) | emerging | Purge or redact untrusted segments from context once they have served their purpose to prevent delayed prompt injection and reduce context bloat |
| [Context Window Anxiety Management](reference/context-memory/context-window-anxiety-management.md) | emerging | Mitigate models that become aware of approaching context window limits and proactively summarize or rush task completion through buffer strategies and counter-prompting |
| [Context Window Auto-Compaction](reference/context-memory/context-window-auto-compaction.md) | validated-in-production | Automatic session compaction triggered by context overflow errors, with smart reserve tokens and lane-aware retry to preserve essential information while staying within token limits |
| [Curated Code Context Window](reference/context-memory/curated-code-context-window.md) | best-practice | Maintain minimal, high-signal code context using search subagent for code discovery |
| [Curated File Context Window](reference/context-memory/curated-file-context-window.md) | best-practice | Sterile curated "main" context window with helper sub-agents for file ranking |
| [Dynamic Context Injection](reference/context-memory/dynamic-context-injection.md) | established | File/folder at-mentions and custom slash commands for on-demand context loading |
| [Episodic Memory Retrieval & Injection](reference/context-memory/episodic-memory-retrieval-injection.md) | validated-in-production | Vector-backed episodic memory store with structured memory blobs |
| [Filesystem-Based Agent State](reference/context-memory/filesystem-based-agent-state.md) | validated-in-production | Persist intermediate results to files for durable checkpoints and workflow resumption |
| [Layered Configuration Context](reference/context-memory/layered-configuration-context.md) | validated-in-production | Hierarchical CLAUDE.md files for enterprise, user, project, and local context layers |
| [Memory Synthesis from Execution Logs](reference/context-memory/memory-synthesis-from-execution-logs.md) | validated-in-production | Two-tier memory system: task diaries + periodic synthesis agents for pattern extraction |
| [Prompt Caching via Exact Prefix Preservation](reference/context-memory/prompt-caching-via-exact-prefix-preservation.md) | best-practice | Preserve exact prefixes, append new messages, order static vs variable content |
| [Progressive Disclosure for Large Files](reference/context-memory/progressive-disclosure-large-files.md) | validated-in-production | Load file metadata first, provide tools to load content on-demand |
| [Proactive Agent State Externalization](reference/context-memory/proactive-agent-state-externalization.md) | emerging | Structured self-documentation framework with hybrid memory architecture |
| [Schema-Guided Graph Retrieval](reference/context-memory/schema-guided-graph-retrieval.md) | emerging | Shared domain schema aligns graph construction, query decomposition, and typed retrieval |
| [Self-Identity Accumulation](reference/context-memory/self-identity-accumulation.md) | emerging | Dual-hook architecture for persistent agent identity/profile across sessions |
| [Semantic Context Filtering](reference/context-memory/semantic-context-filtering.md) | emerging | Extract semantic elements from raw data, filter out noise before LLM consumption |
| [Session-Scoped Context Runtime for Agent Tools](reference/context-memory/session-scoped-context-runtime-for-agent-tools.md) | emerging | Context runtime that caches structured reads and normalizes tool output |
| [Tool Search Lazy Loading](reference/context-memory/tool-search-lazy-loading.md) | emerging | Dynamically load tools via search instead of preloading all available tools |
| [Working Memory via TodoWrite](reference/context-memory/working-memory-via-todos.md) | emerging | Externalize working memory with explicit task tracking and dependency management |
| [Cross-Cycle Consensus Relay](reference/context-memory/cross-cycle-consensus-relay.md) | emerging | Structured context relay for autonomous multi-agent loops across cycles |

### Feedback Loops

Patterns for self-improvement, evaluation, iterative refinement, and quality assurance.

| Pattern | Status | Description |
|---------|--------|-------------|
| [AI-Assisted Code Review / Verification](reference/feedback-loops/ai-assisted-code-review-verification.md) | emerging | Multi-agent code review where one agent generates while another critiques |
| [Background Agent CI Feedback](reference/feedback-loops/background-agent-ci.md) | validated-in-production | Run agent asynchronously in background with CI as objective feedback channel |
| [Coding Agent CI Feedback Loop](reference/feedback-loops/coding-agent-ci-feedback-loop.md) | best-practice | Asynchronous coding agent against CI with partial feedback ingestion |
| [Dogfooding with Rapid Iteration for Agent Improvement](reference/feedback-loops/dogfooding-with-rapid-iteration-for-agent-improvement.md) | best-practice | Development team uses own agent product for daily tasks, rapid feedback loop |
| [Graph of Thoughts](reference/feedback-loops/graph-of-thoughts.md) | emerging | Represent reasoning as a graph with branching, aggregation, and refinement |
| [Incident-to-Eval Synthesis](reference/feedback-loops/incident-to-eval-synthesis.md) | emerging | Convert production incidents into executable eval cases to prevent repeat failures |
| [Inference-Healed Code Review Reward](reference/feedback-loops/inference-healed-code-review-reward.md) | proposed | Decompose code quality into subcriteria with CoT reasoning for explainable feedback |
| [Iterative Prompt & Skill Refinement](reference/feedback-loops/iterative-prompt-skill-refinement.md) | established | Multi-pronged refinement strategy with responsive, owner-led, and dashboard feedback |
| [Reflection Loop](reference/feedback-loops/reflection.md) | established | Self-evaluate output, feed critique into revision — repeat until threshold met |
| [Rich Feedback Loops](reference/feedback-loops/rich-feedback-loops.md) | validated-in-production | Invest in iterative machine-readable feedback infrastructure over prompt perfection |
| [Self-Critique Evaluator Loop](reference/feedback-loops/self-critique-evaluator-loop.md) | emerging | Agent critiques its own output before final delivery |
| [Self-Discover: LLM Self-Composed Reasoning](reference/feedback-loops/self-discover-reasoning-structures.md) | emerging | LLM self-composes its own reasoning structures for complex tasks |
| [Self-Rewriting Meta-Prompt Loop](reference/feedback-loops/self-rewriting-meta-prompt-loop.md) | emerging | Agent rewrites its own system prompt after each interaction |
| [Spec-As-Test Feedback Loop](reference/feedback-loops/spec-as-test-feedback-loop.md) | emerging | Generate executable assertions from specs for continuous spec-code synchronization |
| [Tool Use Incentivization via Reward Shaping](reference/feedback-loops/tool-use-incentivization-via-reward-shaping.md) | emerging | Shape rewards to incentivize effective tool use patterns |

### Learning & Adaptation

Patterns for long-term agent improvement, fine-tuning, skill evolution, and knowledge accumulation.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Agent Reinforcement Fine-Tuning (Agent RFT)](reference/learning-adaptation/agent-reinforcement-fine-tuning.md) | validated-in-production | Train model weights end-to-end on agentic tasks with real tool calls and custom rewards |
| [Compounding Engineering Pattern](reference/learning-adaptation/compounding-engineering-pattern.md) | emerging | Codify all learnings from each feature into reusable prompts, slash commands, hooks |
| [Frontier-Focused Development](reference/learning-adaptation/frontier-focused-development.md) | emerging | Always target the state-of-the-art models, design products that evolve as frontier moves |
| [Memory Reinforcement Learning (MemRL)](reference/learning-adaptation/memory-reinforcement-learning-memrl.md) | proposed | Transfer RL from parameter space to context space, rank memories by learned utility |
| [Shipping as Research](reference/learning-adaptation/shipping-as-research.md) | emerging | Treat shipping as research — release features to learn, not because you're certain |
| [Skill Library Evolution](reference/learning-adaptation/skill-library-evolution.md) | validated-in-production | Agents persist working code as reusable skills that evolve into documented capabilities |
| [Variance-Based RL Sample Selection](reference/learning-adaptation/variance-based-rl-sample-selection.md) | validated-in-production | Run multiple baseline evaluations per sample, prioritize high-variance samples for training |

### Orchestration & Control

Patterns for task decomposition, multi-agent coordination, workflow management, and planning.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Agent-Driven Research](reference/orchestration-control/agent-driven-research.md) | established | Autonomous agent that researches codebases and produces structured reports |
| [Autonomous Workflow Agent Architecture](reference/orchestration-control/autonomous-workflow-agent-architecture.md) | established | Multi-agent architecture for complex engineering task automation |
| [Burn the Boats](reference/orchestration-control/burn-the-boats.md) | emerging | Intentionally kill features to force evolution and prevent paradigm lock-in |
| [Budget-Aware Model Routing](reference/orchestration-control/budget-aware-model-routing.md) | established | Route requests to tiered models with explicit budget contracts and hard caps |
| [Capability-Escrow-Receipt](reference/orchestration-control/capability-escrow-receipt.md) | experimental-but-awesome | Atomic three-object loop for agent-to-agent commerce (capability, escrow, receipt) |
| [Continuous Autonomous Task Loop Pattern](reference/orchestration-control/continuous-autonomous-task-loop-pattern.md) | established | Autonomous task loop with rate-limiting, git automation, and self-recovery |
| [Custom Sandboxed Background Agent](reference/orchestration-control/custom-sandboxed-background-agent.md) | emerging | Custom sandboxed background agent for company-specific dev environments |
| [Declarative Multi-Agent Topology Definition](reference/orchestration-control/declarative-multi-agent-topology-definition.md) | emerging | Define multi-agent systems declaratively, compile to any framework |
| [Deterministic Zero-LLM Orchestration](reference/orchestration-control/deterministic-zero-llm-orchestration.md) | validated-in-production | Deterministic Python orchestrator spending zero LLM tokens on coordination |
| [Discrete Phase Separation](reference/orchestration-control/discrete-phase-separation.md) | emerging | Isolate research, planning, and execution into separate conversations |
| [Disposable Scaffolding Over Durable Features](reference/orchestration-control/disposable-scaffolding-over-durable-features.md) | best-practice | Treat code around models as disposable scaffolding, not durable features |
| [Distributed Execution with Cloud Workers](reference/orchestration-control/distributed-execution-cloud-workers.md) | emerging | Distribute agent work across cloud workers for parallel execution |
| [Dual LLM Pattern](reference/orchestration-control/dual-llm-pattern.md) | emerging | Split privileged and quarantined LLM roles for clear trust boundaries |
| [Economic Value Signaling in Multi-Agent Networks](reference/orchestration-control/economic-value-signaling-multi-agent.md) | experimental-but-awesome | Economic value signaling for multi-agent task prioritization and coordination |
| [Explicit Posterior-Sampling Planner](reference/orchestration-control/explicit-posterior-sampling-planner.md) | emerging | RL-based posterior sampling planner for exploration in uncertain environments |
| [Factory over Assistant](reference/orchestration-control/factory-over-assistant.md) | validated-in-production | Spawn multiple autonomous agents in parallel instead of watching one in a sidebar |
| [Feature List as Immutable Contract](reference/orchestration-control/feature-list-as-immutable-contract.md) | emerging | Treat feature lists as immutable contracts for deterministic agent behavior |
| [Hybrid LLM/Code Workflow Coordinator](reference/orchestration-control/hybrid-llm-code-workflow-coordinator.md) | proposed | Hybrid LLM and code workflow coordinator for deterministic execution |
| [Inference-Time Scaling](reference/orchestration-control/inference-time-scaling.md) | emerging | Allocate additional compute at inference time to improve reasoning quality |
| [Initializer-Maintainer Dual Agent Architecture](reference/orchestration-control/initializer-maintainer-dual-agent.md) | validated-in-production | Dual-agent architecture separating project initialization from incremental development |
| [Inversion of Control](reference/orchestration-control/inversion-of-control.md) | validated-in-production | Invert control: let agents drive their own workflows instead of manual step-by-step prompts |
| [Iterative Multi-Agent Brainstorming](reference/orchestration-control/iterative-multi-agent-brainstorming.md) | experimental-but-awesome | Multi-agent iterative brainstorming for diverse idea generation |
| [Lane-Based Execution Queueing](reference/orchestration-control/lane-based-execution-queueing.md) | validated-in-production | Lane-based queueing for parallel agent execution with isolation guarantees |
| [Language Agent Tree Search (LATS)](reference/orchestration-control/language-agent-tree-search-lats.md) | emerging | Combines Monte Carlo Tree Search with LLM reflection for complex reasoning |
| [LLM Map-Reduce Pattern](reference/orchestration-control/llm-map-reduce-pattern.md) | emerging | Map-reduce workflow isolating untrusted documents across sandboxed LLMs |
| [Multi-Model Orchestration for Complex Edits](reference/orchestration-control/multi-model-orchestration-for-complex-edits.md) | validated-in-production | Pipeline of specialized models for retrieval, generation, and editing tasks |
| [Multi-Step Analysis Pipeline Orchestration](reference/orchestration-control/multi-step-analysis-pipeline-orchestration.md) | emerging | LLM-orchestrated artifact-driven pipeline with semantic step integration |
| [Opponent Processor / Multi-Agent Debate Pattern](reference/orchestration-control/opponent-processor-multi-agent-debate.md) | emerging | Multi-agent debate pattern for bias reduction and validation |
| [Oracle and Worker Multi-Model Approach](reference/orchestration-control/oracle-and-worker-multi-model.md) | emerging | Two-tier system: cheap worker handles bulk, expensive oracle does reasoning |
| [Plan-Then-Execute Pattern](reference/orchestration-control/plan-then-execute-pattern.md) | established | LLM generates fixed tool call sequence before seeing untrusted data; controller enforces graph |
| [Planner-Worker Separation for Long-Running Agents](reference/orchestration-control/planner-worker-separation-for-long-running-agents.md) | emerging | Separate planning from execution for long-running agent sessions |
| [Progressive Autonomy with Model Evolution](reference/orchestration-control/progressive-autonomy-with-model-evolution.md) | best-practice | Progressively increase agent autonomy as model capabilities improve |
| [Progressive Complexity Escalation](reference/orchestration-control/progressive-complexity-escalation.md) | emerging | Start agents with simple tasks, progressively unlock complexity |
| [Recursive Best-of-N Delegation](reference/orchestration-control/recursive-best-of-n-delegation.md) | emerging | Parallel best-of-N at each recursion level, applying parallelism only where uncertain |
| [Signal-Driven Agent Activation](reference/orchestration-control/signal-driven-agent-activation.md) | emerging | Event-driven agent activation responding to signals instead of user commands |
| [Specification-Driven Agent Development](reference/orchestration-control/specification-driven-agent-development.md) | proposed | Spec-first workflow where formal specs are the agent's primary input |
| [Stop Hook Auto-Continue Pattern](reference/orchestration-control/stop-hook-auto-continue-pattern.md) | emerging | Auto-continue agents via stop hooks when success criteria aren't met |
| [Subject Hygiene for Task Delegation](reference/orchestration-control/subject-hygiene.md) | validated-in-production | Descriptive task subjects for traceable and referencable subagent work |
| [Sub-Agent Spawning](reference/orchestration-control/sub-agent-spawning.md) | validated-in-production | Spawn focused sub-agents with isolated contexts for parallel execution |
| [Swarm Migration Pattern](reference/orchestration-control/swarm-migration-pattern.md) | validated-in-production | 10+ parallel sub-agents for large-scale code migrations (10x+ speedup) |
| [Three-Stage Perception Architecture](reference/orchestration-control/three-stage-perception-architecture.md) | established | Three-stage pipeline: perception, processing, action for modular AI agents |
| [Tree-of-Thought Reasoning](reference/orchestration-control/tree-of-thought-reasoning.md) | established | Explore a search tree of intermediate thoughts with branching and pruning |
| [Workspace-Native Multi-Agent Orchestration](reference/orchestration-control/workspace-native-multi-agent-orchestration.md) | emerging | Multi-agent orchestration native to workspace collaboration environments |

### Reliability & Eval

Patterns for ensuring agent reliability, evaluation, fault tolerance, and observability.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Action Caching & Replay](reference/reliability-eval/action-caching-replay.md) | emerging | Record agent actions with metadata for deterministic, zero-LLM-cost replay |
| [Adaptive Sandbox Fan-Out Controller](reference/reliability-eval/adaptive-sandbox-fan-out-controller.md) | emerging | Adaptive fan-out controller scaling parallel sandboxes based on signal |
| [Agent Circuit Breaker](reference/reliability-eval/agent-circuit-breaker.md) | emerging | Prevent token waste on repeatedly failing tools using a circuit breaker state machine |
| [Anti-Reward-Hacking Grader Design](reference/reliability-eval/anti-reward-hacking-grader-design.md) | emerging | Multi-criteria graders with iterative hardening to prevent models from gaming reward functions |
| [Asynchronous Coding Agent Pipeline](reference/reliability-eval/asynchronous-coding-agent-pipeline.md) | proposed | Decouple inference, tool execution, and learning into parallel async components |
| [Canary Rollout and Automatic Rollback for Agent Policy Changes](reference/reliability-eval/canary-rollout-and-automatic-rollback-for-agent-policy-changes.md) | established | Staged traffic rollout with auto-rollback for agent policy changes |
| [CriticGPT-Style Code Review](reference/reliability-eval/criticgpt-style-evaluation.md) | validated-in-production | Specialized AI models for automated code critique and quality evaluation |
| [Extended Coherence Work Sessions](reference/reliability-eval/extended-coherence-work-sessions.md) | rapidly-improving | Models that maintain focus and context over multi-hour sessions |
| [Failover-Aware Model Fallback](reference/reliability-eval/failover-aware-model-fallback.md) | validated-in-production | Semantic error classification with intelligent fallback chains across models |
| [Lethal Trifecta Threat Model](reference/reliability-eval/lethal-trifecta-threat-model.md) | best-practice | Audit tools against private data + untrusted content + external communication capabilities |
| [LLM Observability](reference/reliability-eval/llm-observability.md) | proposed | Span-level tracing of agent workflows with visual UI debugging and aggregate metrics |
| [Merged Code + Language Skill Model](reference/reliability-eval/merged-code-language-skill-model.md) | emerging | Decentralized training + model merging for unified NL and code capabilities |
| [No-Token-Limit Magic](reference/reliability-eval/no-token-limit-magic.md) | experimental-but-awesome | Relax token limits during prototyping to optimize for learning velocity first |
| [Output Verification Loop](reference/reliability-eval/output-verification-loop.md) | emerging | Verify outputs against expected structure before accepting results |
| [RLAIF (Reinforcement Learning from AI Feedback)](reference/reliability-eval/rlaif-reinforcement-learning-from-ai-feedback.md) | emerging | AI-generated preference labels replacing human annotators for scalable alignment training |
| [Schema Validation Retry with Cross-Step Learning](reference/reliability-eval/schema-validation-retry-cross-step-learning.md) | emerging | Multi-attempt retry with detailed error feedback and cross-step error accumulation |
| [Structured Output Specification](reference/reliability-eval/structured-output-specification.md) | established | Constrain outputs using deterministic schemas for reliable validation |
| [Subagent Compilation Checker](reference/reliability-eval/subagent-compilation-checker.md) | emerging | Spawn specialized subagents to independently build and verify code modules |
| [Versioned Constitution Governance](reference/reliability-eval/versioned-constitution-governance.md) | emerging | Version-controlled, signed constitution repository with policy review gates |
| [Workflow Evals with Mocked Tools](reference/reliability-eval/workflow-evals-with-mocked-tools.md) | emerging | End-to-end workflow testing with dual tool implementations (true and mock) |
| [Reliability Problem Map Checklist for RAG and Agents](reference/reliability-eval/wfgy-reliability-problem-map.md) | proposed | Fixed reliability checklist for RAG/agent incident triage across four failure areas |

### Security & Safety

Patterns for securing agent systems, protecting data, and ensuring safe operation.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Action-Selector Pattern](reference/security-safety/action-selector-pattern.md) | emerging | Constrain LLM to action allowlist with schema-validated parameters to prevent prompt injection |
| [Black-Box Skill Invocation](reference/security-safety/black-box-skill-invocation.md) | emerging | Schema-only skill discovery with remote execution to prevent knowledge leakage across agent collaboration boundaries |
| [Cryptographic Governance Audit Trail](reference/security-safety/cryptographic-governance-audit-trail.md) | emerging | Post-quantum signed audit trail for agent tool calls with policy enforcement middleware |
| [Denial Tracking & Permission Escalation](reference/security-safety/denial-tracking-permission-escalation.md) | emerging | Auto-escalate repeated tool denials to blanket permission prompts or fallback strategies |
| [Deterministic Security Scanning Build Loop](reference/security-safety/deterministic-security-scanning-build-loop.md) | proposed | Integrate deterministic security scanning tools into build loops for AI code generation |
| [Deterministic Threat Rule Scanning](reference/security-safety/deterministic-threat-rule-scanning.md) | emerging | Regex-based threat detection rules for agent tool calls and skill definitions |
| [External Credential Sync](reference/security-safety/external-credential-sync.md) | validated-in-production | Cross-source credential synchronization with near-expiry detection and type-aware upgrades |
| [Hook-Based Safety Guard Rails](reference/security-safety/hook-based-safety-guard-rails.md) | validated-in-production | Enforce safety constraints by intercepting agent actions before execution |
| [Isolated VM Per RL Rollout](reference/security-safety/isolated-vm-per-rl-rollout.md) | proposed | Run RL policy rollouts in isolated VMs with controlled interfaces and kill switches |
| [Non-Custodial Spending Controls](reference/security-safety/non-custodial-spending-controls.md) | emerging | Policy enforcement layer between agents and wallet transaction signing |
| [PII Tokenization](reference/security-safety/pii-tokenization.md) | established | Tokenize PII before it reaches the model, untokenize for tool calls |
| [Policy-Gated Tool Proxy](reference/security-safety/policy-gated-tool-proxy.md) | emerging | Transparent proxy between agents and tools with policy evaluation and audit trail |
| [Sandboxed Tool Authorization](reference/security-safety/sandboxed-tool-authorization.md) | validated-in-production | Pattern-based policies with deny-by-default and hierarchical inheritance for tool authorization |
| [Soulbound Identity Verification](reference/security-safety/soulbound-identity-verification.md) | emerging | Non-transferable agent identity credentials with tamper-resistant state transition logging |
| [Tool Capability Compartmentalization](reference/security-safety/tool-capability-compartmentalization.md) | emerging | Split tools into reader/processor/writer micro-tools with per-call consent |
| [Transitive Vouch-Chain Trust](reference/security-safety/transitive-vouch-chain-trust.md) | emerging | Cryptographically signed vouch graph with trust propagation and decay |
| [Zero-Trust Agent Mesh](reference/security-safety/zero-trust-agent-mesh.md) | established | Cryptographic agent identities with mutual trust handshakes and bounded delegation |

### Tool Use & Environment

Patterns for tool discovery, execution, environment management, and integration.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Agent-First Tool Discovery](reference/tool-use-environment/agent-first-tool-discovery.md) | emerging | Machine-readable search index for agent consumers with agentic scoring and verification |
| [Agent-First Tooling and Logging](reference/tool-use-environment/agent-first-tooling-and-logging.md) | established | Design tooling and logging for machine-readability over human ergonomics |
| [Agent SDK for Programmatic Control](reference/tool-use-environment/agent-sdk-for-programmatic-control.md) | emerging | SDK exposing agent core functionalities for programmatic access and automation |
| [Agentic Search Over Vector Embeddings](reference/tool-use-environment/agentic-search-over-vector-embeddings.md) | best-practice | Replace vector search with bash/grep-based agentic search for codebases |
| [AI Web Search Agent Loop](reference/tool-use-environment/ai-web-search-agent-loop.md) | emerging | Iterative web search with coordinating agent managing parallel worker agents |
| [CLI-First Skill Design](reference/tool-use-environment/cli-first-skill-design.md) | emerging | Design all skills as CLI tools first for dual-use by humans and agents |
| [CLI-Native Agent Orchestration](reference/tool-use-environment/cli-native-agent-orchestration.md) | proposed | First-class CLI interface for agent capabilities with structured output and exit codes |
| [Code-First Tool Interface Pattern](reference/tool-use-environment/code-first-tool-interface-pattern.md) | established | LLMs generate TypeScript code to orchestrate MCP tools in ephemeral V8 isolates |
| [Code-Over-API Pattern](reference/tool-use-environment/code-over-api-pattern.md) | established | Agents write and execute code that processes data in execution environment instead of direct API calls |
| [Code-Then-Execute Pattern](reference/tool-use-environment/code-then-execute.md) | best-practice | Generate code first, then execute — never execute without generating code first |
| [Code-Then-Execute Pattern (Security)](reference/tool-use-environment/code-then-execute-pattern.md) | emerging | LLM outputs sandboxed DSL script with static taint analysis for security-sensitive workflows |
| [Cross-Protocol Agent Discovery](reference/tool-use-environment/cross-protocol-agent-discovery.md) | emerging | Aggregate agent metadata across fragmented registries and protocols into unified discovery |
| [Dual-Use Tool Design](reference/tool-use-environment/dual-use-tool-design.md) | best-practice | Design tools equally accessible to both humans and AI agents with shared interfaces |
| [Dynamic Code Injection (On-Demand File Fetch)](reference/tool-use-environment/dynamic-code-injection-on-demand-file-fetch.md) | established | On-demand file injection via @filename syntax for interactive coding sessions |
| [Egress Lockdown (No-Exfiltration Channel)](reference/tool-use-environment/egress-lockdown-no-exfiltration-channel.md) | established | Egress firewall for agent tools with domain-specific outbound controls |
| [Intelligent Bash Tool Execution](reference/tool-use-environment/intelligent-bash-tool-execution.md) | validated-in-production | Multi-mode execution with adaptive fallback: direct exec to PTY with security-aware approval |
| [LLM-Friendly API Design](reference/tool-use-environment/llm-friendly-api-design.md) | emerging | Design APIs with explicit versioning, self-descriptive functionality, and clear error messages for LLMs |
| [MCP Pattern Injection](reference/tool-use-environment/mcp-pattern-injection.md) | validated-in-production | Use MCP servers to inject production patterns directly into AI assistant context |
| [Multi-Platform Communication Aggregation](reference/tool-use-environment/multi-platform-communication-aggregation.md) | emerging | Unified search interface querying all communication platforms in parallel |
| [Multi-Platform Webhook Triggers](reference/tool-use-environment/multi-platform-webhook-triggers.md) | emerging | Webhook triggers from SaaS tools (Notion, Slack, Jira) to initiate agent workflows |
| [Parallel Tool Call Learning](reference/tool-use-environment/parallel-tool-call-learning.md) | emerging | Learn optimal parallel tool call strategies from execution data |
| [Conditional Parallel Tool Execution](reference/tool-use-environment/parallel-tool-execution.md) | validated-in-production | Conditional parallel tool execution based on read-only vs stateful classification |
| [Patch Steering via Prompted Tool Selection](reference/tool-use-environment/patch-steering-via-prompted-tool-selection.md) | best-practice | Guide agent's tool selection through explicit natural language instructions in prompts |
| [Progressive Tool Discovery](reference/tool-use-environment/progressive-tool-discovery.md) | established | Filesystem-like tool hierarchy with on-demand discovery by exploring structure |
| [Shell Command Contextualization](reference/tool-use-environment/shell-command-contextualization.md) | established | Execute shell commands with automatic capture and injection of output into agent context |
| [Static Service Manifest for Agents](reference/tool-use-environment/static-service-manifest-for-agents.md) | emerging | Static, machine-readable service manifest at well-known URL for capability discovery |
| [Tool Selection Guide](reference/tool-use-environment/tool-selection-guide.md) | emerging | Guide for optimal tool selection to avoid common anti-patterns |
| [Tool Use Steering via Prompting](reference/tool-use-environment/tool-use-steering-via-prompting.md) | best-practice | Guide agent tool selection through explicit natural language instructions |
| [Unified Tool Gateway](reference/tool-use-environment/unified-tool-gateway.md) | emerging | Single gateway between agents and external tool providers handling discovery, auth, routing, billing |
| [Virtual Machine Operator Agent](reference/tool-use-environment/virtual-machine-operator-agent.md) | established | Equip agent with access to dedicated VM environment for arbitrary code execution |
| [Visual AI Multimodal Integration](reference/tool-use-environment/visual-ai-multimodal-integration.md) | emerging | Integrate large multimodal models for visual understanding capabilities |

### UX & Collaboration

Patterns for human-agent collaboration, handoffs, workflow design, and communication.

| Pattern | Status | Description |
|---------|--------|-------------|
| [Abstracted Code Representation for Review](reference/ux-collaboration/abstracted-code-representation-for-review.md) | proposed | Pseudocode and intent-based summaries for faster human code review of AI-generated code |
| [Agent-Assisted Scaffolding](reference/ux-collaboration/agent-assisted-scaffolding.md) | validated-in-production | AI-generated initial structure and boilerplate for new features and modules |
| [Agent-Friendly Workflow Design](reference/ux-collaboration/agent-friendly-workflow-design.md) | best-practice | Design workflows that align with agent capabilities and limitations |
| [Agent Modes by Model Personality](reference/ux-collaboration/agent-modes-by-model-personality.md) | emerging | Agent modes tailored to each model's personality and working style |
| [AgentFund: Milestone Escrow for Agent Resource Funding](reference/ux-collaboration/agentfund-crowdfunding.md) | emerging | Milestone-based escrow with verifiable release conditions for agent resource funding |
| [AI-Accelerated Learning and Skill Development](reference/ux-collaboration/ai-accelerated-learning-and-skill-development.md) | validated-in-production | AI agents as interactive learning tools that accelerate skill acquisition and taste development |
| [Chain-of-Thought Monitoring & Interruption](reference/ux-collaboration/chain-of-thought-monitoring-interruption.md) | emerging | Real-time surveillance of agent reasoning with interrupt capability for course correction |
| [Codebase Optimization for Agents](reference/ux-collaboration/codebase-optimization-for-agents.md) | emerging | Optimize codebases for agents first, humans second, with agent-first tooling and feedback loops |
| [Democratization of Tooling via Agents](reference/ux-collaboration/democratization-of-tooling-via-agents.md) | emerging | Empower non-technical users to build custom tools using AI agents |
| [Dev Tooling Assumptions Reset](reference/ux-collaboration/dev-tooling-assumptions-reset.md) | emerging | Re-examine dev tooling assumptions from first principles when agents write most code |
| [Human-in-the-Loop Approval Framework](reference/ux-collaboration/human-in-loop-approval-framework.md) | validated-in-production | Insert human approval gates for high-risk agent actions |
| [Latent Demand Product Discovery](reference/ux-collaboration/latent-demand-product-discovery.md) | best-practice | Build hackable products and observe power user behavior to reveal latent demand |
| [Proactive Trigger Vocabulary](reference/ux-collaboration/proactive-trigger-vocabulary.md) | emerging | Explicit trigger phrases for skill activation with proactive and reactive modes |
| [Seamless Background-to-Foreground Handoff](reference/ux-collaboration/seamless-background-to-foreground-handoff.md) | emerging | Context-preserving transition from autonomous background agents to human-in-the-loop refinement |
| [Spectrum of Control / Blended Initiative](reference/ux-collaboration/spectrum-of-control-blended-initiative.md) | validated-in-production | Support a spectrum of agent autonomy from inline completion to fully autonomous background agents |
| [Team-Shared Agent Configuration as Code](reference/ux-collaboration/team-shared-agent-configuration.md) | best-practice | Check agent configuration into version control for consistent team behavior |
| [Verbose Reasoning Transparency](reference/ux-collaboration/verbose-reasoning-transparency.md) | best-practice | On-demand verbose output showing agent's internal reasoning, tool selection, and confidence scores |

## How to use this skill

When the user asks about agentic patterns, agent architecture, or how to solve a specific agent-related challenge:

1. **Identify the problem domain** — context management, reliability, security, orchestration, tool use, feedback, learning, or human collaboration.
2. **Match to relevant patterns** from the catalog tables above.
3. **Read reference files** for detailed guidance on each recommended pattern. Read the full reference file (e.g., `reference/orchestration-control/discrete-phase-separation.md`) to get the complete picture: problem, solution, implementation, trade-offs, and when NOT to use. **ALWAYS include the pattern's status/maturity label** (e.g., `emerging`, `validated-in-production`, `best-practice`) when presenting each pattern — this is in the YAML frontmatter of each reference file.
4. **Present patterns with file paths** — ALWAYS include the reference file path in the format `reference/<category>/<pattern>.md` for each pattern you recommend. This enables the user to read the full details and navigate to the reference file.
5. **Consider trade-offs** — every pattern has pros and cons; present them honestly. Include a "When NOT to use" note where applicable.
6. **Suggest combinations** — patterns often work best when combined (e.g., Circuit Breaker + Tool Steering). See the pattern combinations section below.
7. **Check evidence level** — note which patterns are `validated-in-production` vs `emerging` vs `experimental`. This helps the user assess risk.

## Pattern combinations

Patterns often work best when combined. Here are some proven combinations:

| Combination | Why it works |
|-------------|--------------|
| **Circuit Breaker + Failover** | Circuit breaker detects failure, failover routes to backup |
| **Structured Output + Reflection** | Structured output enables reliable parsing, reflection improves quality |
| **Discrete Phase Separation + Sub-Agent Spawning** | Phase separation isolates concerns, sub-agents execute in parallel |
| **Context Minimization + Prompt Caching** | Minimize context to reduce tokens, cache prefixes to save costs |
| **Tool Use Steering + Code-Then-Execute** | Steering guides tool selection, code-then-execute ensures auditability |
| **Multi-Agent Brainstorming + Spec-As-Test** | Brainstorming generates ideas, spec-as-test validates them |
| **Agent Circuit Breaker + Adaptive Sandbox Fan-Out** | Circuit breaker prevents waste, fan-out scales parallel work |
| **Inversion of Control + Progressive Autonomy** | Let agents drive their workflow, gradually increase autonomy |

## When NOT to use patterns

Not every problem needs a pattern. Avoid over-engineering:

- **Simple, one-off tasks** — Don't apply complex orchestration for a single file edit
- **Deterministic workflows** — If the solution is purely rule-based, skip the LLM
- **Tiny codebases** — Context window limits don't matter for <100 file projects
- **Real-time systems** — Agent loops add latency; not suitable for sub-second responses

## Pattern metadata

Each reference file includes:

- **title** — Pattern name
- **status** — Maturity: `best-practice`, `validated-in-production`, `established`, `emerging`, `proposed`, `experimental-but-awesome`. **ALWAYS include this status when presenting a pattern.**
- **authors** — Contributors and originators
- **source** — Primary reference URL
- **tags** — Searchable keywords
- **Problem** — What challenge does it solve?
- **Solution** — How does it solve it?
- **Evidence** — Evidence grade and key findings
- **How to use it** — Practical implementation guidance
- **Trade-offs** — Pros and cons
- **References** — Additional resources

## External resources

- **Website**: [https://agentic-patterns.com](https://agentic-patterns.com) — Interactive pattern explorer, compare tool, decision guide, graph visualization
- **llms.txt**: [https://agentic-patterns.com/llms.txt](https://agentic-patterns.com/llms.txt) — Machine-readable documentation for AI assistants
- **GitHub**: [nibzard/awesome-agentic-patterns](https://github.com/nibzard/awesome-agentic-patterns) — Full source with 180+ patterns

## Documentation sources

- **Raw docs**: `raw/agentic-patterns-extra-docs/` — 171 unprocessed markdown files, one per pattern (flat structure)
- **Reference docs**: `reference/` — 173 distilled reference files organized by category (8 categories), plus `INDEX.md`
- **Source repo**: [nibzard/awesome-agentic-patterns](https://github.com/nibzard/awesome-agentic-patterns) — Original patterns with templates, categories, and metadata

The reference directory is a curated, categorized subset of the raw docs. Each reference file follows the same structure as the source templates (title, status, authors, source, tags, problem, solution, evidence, how to use, trade-offs, references).

## Documentation structure

This skill's documentation is organized in three layers:

| Layer | Location | Purpose |
|-------|----------|---------|
| **Catalog** | This file (SKILL.md) | Quick-reference index of all 180+ patterns with status and one-line descriptions |
| **Reference** | `reference/<category>/<pattern>.md` | Detailed pattern docs: problem, solution, implementation, trade-offs, evidence |
| **Raw sources** | `raw/agentic-patterns-extra-docs/` | Original documentation files (171 files, flat structure) before distillation into reference/ |

The `reference/` directory is the curated, categorized output distilled from the raw docs. Each reference file corresponds to a raw doc file (with minor naming normalization for consistency). The INDEX.md in `reference/` provides a complete cross-reference between categories and patterns.
