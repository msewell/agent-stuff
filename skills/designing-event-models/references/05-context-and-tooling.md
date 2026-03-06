## Table of Contents

1. [Relationship to DDD, CQRS, and Event Sourcing](#13-relationship-to-ddd-cqrs-and-event-sourcing)
2. [Tooling](#14-tooling)
3. [When to Use Event Modeling](#15-when-to-use-event-modeling)

---

## 13. Relationship to DDD, CQRS, and Event Sourcing

Event Modeling does not require any specific architecture or implementation pattern, but it has natural affinities with several established approaches.

### Domain-Driven Design (DDD)

| DDD Concept | Event Modeling Connection |
|---|---|
| **Ubiquitous Language** | The event model *is* the ubiquitous language, made visual. Events, commands, and read models use business terminology understood by all stakeholders. |
| **Bounded Contexts** | Swimlanes in the event model naturally identify bounded contexts. Events that cluster together often share a context. |
| **Aggregates** | Each swimlane often maps to an aggregate. The aggregate enforces the business rules captured in GWT scenarios. |
| **Domain Events** | The orange sticky notes *are* domain events. Event Modeling makes them first-class citizens of the design. |

As Adam Dymitruk observed: "By working with Event Modeling, we achieved all of DDD without doing DDD."

### CQRS (Command Query Responsibility Segregation)

Event Modeling naturally embodies CQRS:

- **Commands** (blue) represent the write side -- changing system state.
- **Read Models** (green) represent the read side -- querying system state.
- The two are always separate in the model. There is no single element that both writes and reads.

You can implement a system designed with Event Modeling without CQRS (using a single data store for reads and writes), but the model's structure naturally suggests the separation.

### Event Sourcing

Event Sourcing is the implementation pattern most naturally aligned with Event Modeling:

- In Event Sourcing, you store **events** (facts about what happened) rather than current state.
- Events are **immutable** and **append-only**.
- Current state is **derived** from events via projections (read models).

This matches Event Modeling's structure exactly: events are the source of truth; read models are derived from events; commands produce events.

**However, Event Modeling does not require Event Sourcing.** An "event" in the model simply means "data was persisted." That persistence can be a row in a relational table, a document in MongoDB, or a record in an event store. The model works regardless.

### The Processor TODO-List Pattern

For automations, the book and community advocate a pattern called the **Processor TODO-List**:

1. A read model acts as a "TODO list" for a background processor.
2. For each item on the list, the processor issues a command.
3. The resulting event "checks off" the item from the TODO list.
4. The processor polls or is notified to process remaining items.

This pattern replaces complex saga orchestration with a simple, stateless, retryable mechanism. Each process step is a local decision based on the current state of the system. If a step fails, the TODO item remains on the list and is retried.

---

## 14. Tooling

### Whiteboard + Sticky Notes

The original and still-valid approach. Physical sticky notes on a large wall or whiteboard. Best for co-located teams in initial brainstorming sessions. Limitations: not persistent, hard to share remotely, doesn't scale.

### Miro + Event Modeling Plugin

[Miro](https://miro.com/marketplace/eventmodeling/) is the most widely used digital tool for Event Modeling. The Event Modeling plugin (built by Martin Dilger / Nebulit) adds:
- Structured element types for events, commands, read models
- Live validation of information completeness
- Navigation and element linking
- Code generation from the model

Best for teams already using Miro for other collaboration. Free for commercial use (limited to one board).

### Qlerify

[Qlerify](https://www.qlerify.com/event-modeling-tool) is a purpose-built modeling tool with AI capabilities:
- Generates event models from descriptions
- Supports Event Storming, DDD, and User Story Mapping
- Produces technical deliverables (backlog items, code scaffolding)
- Structured domain model rather than freeform canvas

Best for teams wanting to move from workshop to backlog to code with minimal friction.

### Other Tools

- **ONote / Evident Design** -- Browser-based tool built specifically for event modeling. Focuses on the cadence of event modeling with real-time collaboration.
- **Modellution** -- Web platform for visual modeling with estimation, Jira/ClickUp integration, and code generation.
- **Draft.io** -- Lightweight diagramming tool with event modeling templates.

### Choosing a Tool

| Need | Recommendation |
|---|---|
| First workshop with a co-located team | Physical whiteboard + sticky notes |
| Remote team, already using Miro | Miro + Event Modeling plugin |
| Want AI-assisted modeling and code generation | Qlerify |
| Dedicated event modeling workflow | ONote / Evident Design |
| Simple, low-commitment start | Any digital whiteboard (Miro, Mural, FigJam) with colored shapes |

---

## 15. When to Use Event Modeling

### Strong Fit

- **Greenfield projects.** Plan the entire system before writing code. Surface assumptions, discover gaps, and align all stakeholders.
- **System modernization / rewrite.** Model the existing system to document it, then model the target system to plan the migration.
- **Complex business processes.** Any system with multi-step workflows, business rules, and multiple actors.
- **Cross-team projects.** The event model provides a shared artifact that bridges technical and business perspectives.
- **Onboarding and documentation.** An up-to-date event model is more useful than any amount of written documentation.

### Moderate Fit

- **Single-feature refinements.** Even without modeling the whole system, you can model individual features to clarify requirements and define test cases.
- **API design.** The model's commands and read models naturally map to API endpoints.
- **Legacy system documentation.** Model the existing system to build shared understanding, even if you don't plan to rewrite it.

### Weak Fit

- **Pure infrastructure / DevOps work.** Event Modeling is about information systems and data flow, not about deployment pipelines or infrastructure provisioning.
- **Trivial CRUD applications.** If the system is genuinely just create/read/update/delete on a single entity with no business rules, Event Modeling adds overhead without proportional value.
- **Exploratory research / prototyping.** If you genuinely don't know what you're building yet, start with Event Storming for discovery, then move to Event Modeling when the direction is clearer.

### Regardless of Architecture

A common misconception: "We can't use Event Modeling because we don't have an event-driven architecture." This is false. Event Modeling describes *what data flows through the system*, not *how it is implemented*. An "event" in the model simply means "data was persisted." You can use Event Modeling to design systems built with:

- Traditional CRUD / relational databases
- Microservices or monoliths
- REST APIs, GraphQL, gRPC
- Event Sourcing + CQRS
- Legacy systems written in any language

---

