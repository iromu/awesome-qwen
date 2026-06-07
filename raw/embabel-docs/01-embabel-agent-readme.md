# Embabel Agent Framework - Main README

Source: https://github.com/embabel/embabel-agent

## Overview

Embabel (Em-BAY-bel) is a framework for authoring agentic flows on the JVM that seamlessly mix LLM-prompted interactions with code and domain models. Supports intelligent path finding towards goals. Written in Kotlin but offers a natural usage model from Java. From the creator of Spring.

## Key Concepts

Models agentic flows in terms of:

- **Actions**: Steps an agent takes
- **Goals**: What an agent is trying to achieve
- **Conditions**: Conditions to assess before executing an action or determining that a goal has been achieved. Conditions are reassessed after each action is executed.
- **Domain model**: Objects underpinning the flow and informing Actions, Goals and Conditions.
- **Plan**: A sequence of actions to achieve a goal. Plans are dynamically formulated by the system, not the programmer. The system replans after the completion of each action, allowing it to adapt to new information as well as observe the effects of the previous action. This is effectively an OODA loop.

> Application developers don't usually have to deal with these concepts directly, as most conditions result from data flow defined in code, allowing the system to infer pre and post conditions.

## Differentiators

- **Sophisticated planning.** Goes beyond a finite state machine or sequential execution with nesting by introducing a true planning step, using a non-LLM AI algorithm. This enables the system to perform tasks it wasn't programmed to do by combining known steps in a novel order, as well as make decisions about parallelization and other runtime behavior.
- **Superior extensibility and reuse**: Because of dynamic planning, adding more domain objects, actions, goals and conditions can extend the capability of the system, without editing FSM definitions or existing code.
- **Strong typing and the benefits of object orientation**: Actions, goals and conditions are informed by a domain model, which can include behavior. Everything is strongly typed and prompts and manually authored code interact cleanly. No more magic maps. Enjoy full refactoring support.
- **Platform abstraction**: Clean separation between programming model and platform internals allows running locally while potentially offering higher QoS in production without changing application code.
- **Designed for LLM mixing**: It is easy to build applications that mix LLMs, ensuring the most cost-effective yet capable solution. This enables the system to leverage the strengths of different models for different tasks. In particular, it facilitates the use of local models for point tasks. This can be important for cost and privacy.
- **Built on Spring and the JVM**, making it easy to access existing enterprise functionality and capabilities.
  - Spring can inject and manage agents, including using Spring AOP to decorate functions.
  - Robust persistence and transaction management solutions are available.
- **Designed for testability** from the ground up. Both unit testing and agent end to end testing are easy.

## Flow Authoring

Flows can be authored in one of two ways:

- An annotation-based model similar to Spring MVC, with types annotated with the Spring stereotype `@Agent`, using `@Goal`, `@Condition` and `@Action` methods.
- Idiomatic Kotlin DSL with `agent {` and `action {` blocks.

Either way, flows are backed by a domain model of objects that can have rich behavior.

## Planning

The planning step is pluggable.

- **GOAP (Goal Oriented Action Planning)**: Default planning approach. A popular AI planning algorithm used in gaming. It allows for dynamic decision-making and action selection based on the current state of the world and the goals of the agent.
- **Utility AI**: Chooses actions based on (potentially dynamic) utility scores rather than strict preconditions and postconditions. This is valuable for exploration and open-ended tasks.

## Execution Modes

The framework executes via an `AgentPlatform` implementation. An agent platform supports the following modes of execution:

- **Focused**: User code requests particular functionality. User code calls a method to run a particular agent, passing in input. This is ideal for code-driven flows such as a flow invoked in response to an incoming event.
- **Closed**: User intent (or another incoming event) is classified to choose an agent. The platform tries to find a suitable agent among all the agents it knows about. Agent choice is dynamic, but only actions defined within the particular agent will run.
- **Open**: The user's intent is assessed and the platform uses all its resources to try to achieve it. The platform tries to find a suitable goal among all the goals it knows about and builds a custom agent to achieve it from the start state, including relevant actions and conditions. The platform will not proceed if it is unconvinced as to the applicability of any goal.

Open mode is the most powerful, but least deterministic.

## Quick Start

Create your own agent repo from our [Java](https://github.com/embabel/java-agent-template) or [Kotlin](https://github.com/embabel/kotlin-agent-template) GitHub template by clicking the "Use this template" button.

You'll have an agent running in under a minute if you already have an `OPENAI_API_KEY` and have Maven installed.

## Dog Food Policy

Embabel practices extreme dogfooding - using AI agents to help every aspect of the project including coding, documentation, community management, and producing marketing copy.

Key principles:
1. Use AI agents to help every aspect of the project
2. Developers retain ultimate control
3. Favour open source agents built on the Embabel platform
4. Prioritize agents that help accelerate progress

## Environment Variables

Required:
- `OPENAI_API_KEY`: For the OpenAI API

Optional:
- `ANTHROPIC_API_KEY`: For the Anthropic API. Necessary for the coding agent.
- `MINIMAX_API_KEY`: For the MiniMax API. Supports MiniMax-M2.7 and MiniMax-M2.7-highspeed models.
- OCI Generative AI uses OCI SDK authentication providers.

## Services

Docker Desktop version >4.43.2 recommended. Activate MCP tools from the catalog:
- Brave Search
- Fetch
- Puppeteer
- Wikipedia

## LLM Support

### Local models with well-known providers
- Ollama: Add `embabel-agent-starter-ollama` starter
- Docker: Add `embabel-agent-starter-dockermodels` starter
- LMStudio: Uses the openAI compatible client

### OCI Generative AI
Add `embabel-agent-starter-oci-genai` to use OCI Generative AI chat and embedding models.

## Related Projects

- [Embabel Agent Examples](https://github.com/embabel/embabel-agent-examples) - Examples and tutorials
- [Tripper](https://github.com/embabel/tripper) - Sophisticated travel planner agent
- [Coding Agent](https://github.com/embabel/coding-agent) - Open source coding agent
- [Flicker](https://github.com/embabel/flicker) - Movie recommendation engine
- [Decker](https://github.com/embabel/decker) - Agent to build presentations
- [DICE](https://github.com/embabel/dice) - Context Engineering
- [IntelliJ Plugin](https://github.com/embabel/embabel-agent-intellij) - Developer tooling

## Links

- Documentation: https://docs.embabel.com/embabel-agent/guide/0.5.0-SNAPSHOT/
- MvnRepository: https://mvnrepository.com/artifact/com.embabel.agent/embabel-agent-api
- Discord: https://discord.gg/t6bjkyj93q
- License: Apache 2.0
