# Embabel Framework - Overview & Core Concepts

Source: https://docs.embabel.com/embabel-agent/guide/0.1.2-SNAPSHOT/

## What is Embabel?

Embabel (Em-BAY-bel) is a framework for authoring agentic flows on the JVM that seamlessly mix LLM-prompted interactions with code and domain models. Supports intelligent path finding towards goals. Written in Kotlin but offers a natural usage model from Java. From the creator of Spring (Rod Johnson).

## Key Concepts

- **Actions**: Steps an agent takes
- **Goals**: What an agent is trying to achieve
- **Conditions**: Conditions to assess before executing an action or determining that a goal has been achieved. Conditions are reassessed after each action is executed.
- **Domain model**: Objects underpinning the flow and informing Actions, Goals and Conditions.
- **Plan**: A sequence of actions to achieve a goal. Plans are dynamically formulated by the system, not the programmer. The system replans after the completion of each action, allowing it to adapt to new information as well as observe the effects of the previous action. This is effectively an OODA loop.

## Differentiators

### Sophisticated Planning
Goes beyond a finite state machine or sequential execution with nesting by introducing a true planning step, using a non-LLM AI algorithm. This enables the system to perform tasks it wasn't programmed to do by combining known steps in a novel order, as well as make decisions about parallelization and other runtime behavior.

### Superior Extensibility and Reuse
Because of dynamic planning, adding more domain objects, actions, goals and conditions can extend the capability of the system, without editing FSM definitions or existing code.

### Strong Typing and Object Orientation
Actions, goals and conditions are informed by a domain model, which can include behavior. Everything is strongly typed and prompts and manually authored code interact cleanly. No more magic maps.

### Platform Abstraction
Clean separation between programming model and platform internals allows running locally while potentially offering higher QoS in production without changing application code.

### LLM Mixing
It is easy to build applications that mix LLMs, ensuring the most cost-effective yet capable solution.

### Spring and JVM Integration
Built on Spring and the JVM, making it easy to access existing enterprise functionality and capabilities.

### Designed for Testability
Both unit testing and agent end-to-end testing are easy from the ground up.

## Execution Modes

- **Focused**: User code requests particular functionality
- **Closed**: User intent is classified to choose an agent
- **Open**: The user's intent is assessed and the platform uses all its resources to try to achieve it

## Planning Algorithms

- **GOAP** (Goal Oriented Action Planning) - Default
- **Utility AI** - Chooses actions based on utility scores

## Repository & Links

- GitHub: https://github.com/embabel/embabel-agent
- Examples: https://github.com/embabel/embabel-agent-examples
- Java Template: https://github.com/embabel/java-agent-template
- Kotlin Template: https://github.com/embabel/kotlin-agent-template
- Tripper (Travel Planner): https://github.com/embabel/tripper
- Discord: https://discord.gg/t6bjkyj93q
