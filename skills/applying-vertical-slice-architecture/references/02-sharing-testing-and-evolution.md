# Sharing, Testing, and Evolution

## Table of Contents

- [Handling Shared Code](#handling-shared-code)
  - [Three Tiers of Sharing](#three-tiers-of-sharing)
  - [Decision Rules](#decision-rules)
- [Cross-Cutting Concerns](#cross-cutting-concerns)
- [The BFF Coupling Trap](#the-bff-coupling-trap)
- [Eventual Consistency Across Slices](#eventual-consistency-across-slices)
  - [Projection Strategies](#projection-strategies)
  - [UX Strategies for Masking Lag](#ux-strategies-for-masking-lag)
- [Testing Strategy](#testing-strategy)
  - [Test Slice Wiring at Its Boundary](#test-slice-wiring-at-its-boundary)
  - [Use Given / When / Then as the Slice Contract](#use-given--when--then-as-the-slice-contract)
  - [Use Focused Tests for Pure Rules](#use-focused-tests-for-pure-rules)
  - [Use the Real Engine for Database Semantics](#use-the-real-engine-for-database-semantics)
- [Synergy with CQRS and Event Modeling](#synergy-with-cqrs-and-event-modeling)
- [Evolution and Migration](#evolution-and-migration)
  - [The Evolution Path](#the-evolution-path)
  - [Migrating from an Existing Layered Codebase](#migrating-from-an-existing-layered-codebase)
- [Common Anti-Patterns](#common-anti-patterns)

---

## Handling Shared Code

The instinct to create a `Common/` or `Shared/` project is strong — resist it until you have a disciplined framework.

### Three Tiers of Sharing

**Tier 1 — Technical Infrastructure (share freely).** Pure plumbing that applies uniformly: logging, authentication middleware, database connection factories, the `Result` pattern, validation pipeline behaviors. Place in `SharedKernel/` or `Infrastructure/`.

**Tier 2 — Domain Concepts (push into entities/value objects).** Business rules belong on the entities and value objects themselves. Multiple slices can depend on the same `Order` entity without coupling to each other. This is sharing through the domain model, not through service classes.

**Tier 3 — Feature-local sharing (keep it near the slices that use it).** If only `Orders/` slices need a pricing calculation, keep `OrderPricingService` in `Orders/Shared/`. When the feature is deleted, the shared code goes with it — no zombie code.

### Decision Rules

1. **Apply the Rule of Three.** Do not extract shared code until three separate locations use identical, stable logic. Premature abstraction creates the wrong abstraction.
2. **Duplication is cheaper than the wrong abstraction.** Two slices with similar-looking response DTOs should *not* be unified. Tomorrow's requirements will diverge. Accept structural duplication when the concepts are semantically distinct.
3. **Never let one slice call into another slice's internals.** If Slice A needs data that Slice B produces, Slice A queries the database directly (the domain entity is shared, the slice is not). For triggering side effects across boundaries, use domain events or a messaging abstraction.

---

## Cross-Cutting Concerns

Authentication, authorization, logging, validation, caching, and transaction management are inherently cross-cutting. Handle them via framework-level mechanisms, not per-slice code:

- **Middleware / filters / interceptors** for authentication, logging, and error handling
- **Pipeline behaviors** (e.g., MediatR behaviors, decorator chains) for validation and transaction management
- **Aspect-oriented approaches** for audit trails and performance monitoring

The goal: individual slices contain *zero* boilerplate for cross-cutting concerns. A developer writing a new slice should only write business logic.

---

## The BFF Coupling Trap

A Backend-for-Frontend layer aggregates data from multiple slices into a single response tailored for a specific client. While this can reduce API calls, it introduces a subtle coupling vector.

**The problem:** A BFF endpoint that combines data from the `Orders` and `Inventory` slices now couples those slices at the API layer. A change to either slice's read model may require a corresponding change in the BFF. Over time, the BFF accumulates its own lifecycle, its own bugs, and its own deployment constraints — becoming a coordination bottleneck.

**Prefer client-side composition for presentation only.** Let slices expose independent, already-authorized views when the client merely arranges them on screen. Do not fetch fields the client is not allowed to see and hide them in the UI.

**Compose in a server-side use case when the combination changes the business result or what the caller may learn.** The use case decides which source owns each field, whether a partial result is usable, and what may be disclosed. For example, a client can place order and stock panels side by side, but it should not decide whether an unavailable stock read means an order may proceed.

**Keep the BFF thin.** Map and serialize the use case’s approved output; do not make the BFF own cross-slice business rules. Keep explicit, versioned dependencies and monitor for scope creep.

**Consider GraphQL as an alternative.** A GraphQL layer can let clients query across slices without a hand-written BFF, since clients specify exactly what fields they need. The trade-off is that you introduce a schema that spans slice boundaries, which requires governance.

---

## Eventual Consistency Across Slices

When write slices publish events that asynchronously update read-model slices, the read side may lag behind. This is an inherent trade-off of separating commands from queries with independent data stores.

### Projection Strategies

**Synchronous / inline projections.** Update the read model within the same transaction as the write. Guarantees immediate consistency but couples write throughput to projection count. Best for systems with a small number of read models per write.

**Asynchronous projections.** The read model is updated by a background process that consumes events after the write transaction commits. Scales independently but introduces a consistency lag window. This is the default approach for most event-driven systems.

**Live projections.** Rebuild the read model on-the-fly from the event stream at query time. No staleness, but performance degrades as event streams grow. Suitable for low-traffic or admin-facing views.

**Hybrid.** Use inline projections for the "read your own writes" path (the user who just performed the action) and async projections for everyone else.

### UX Strategies for Masking Lag

- **Optimistic UI updates.** Show the expected state immediately in the client, then reconcile when the read model catches up.
- **Version-based blocking.** Return a version/position token from the command. Pass it with subsequent queries and block until the projection reaches that version.
- **Read-from-primary window.** Route the acting user's queries to the primary data store for a short time window (e.g., 5 seconds) after a write.
- **Redirect away from staleness.** After creating an order, navigate to a confirmation page rather than immediately showing the order list, giving the projection time to update.

The right strategy depends on context. Most systems only need to solve "read your own writes" — other users seeing slightly stale data is usually acceptable.

---

## Testing Strategy

### Test Slice Wiring at Its Boundary

For wiring and side effects, exercise the slice through its entry point: send a request and assert the response and effects, such as a committed row or published event. This can run in process; a browser or full deployment is unnecessary unless the risk depends on it.

### Use Given / When / Then as the Slice Contract

Treat each slice as a black box:

- **Given:** Preconditions (database state, prior events)
- **When:** The request/command/query
- **Then:** The expected response and side effects

This aligns testing with the slice boundary and makes tests resilient to internal refactoring.

### Use Focused Tests for Pure Rules

Test a pure rule directly whenever that check can expose the defect, even if the rule is simple. Put complex domain behavior in the domain model rather than the handler.

### Use the Real Engine for Database Semantics

Use private, real infrastructure for risks that depend on it. An in-memory repository can support a behavioral test that does not depend on database behavior, but it cannot verify engine-specific constraints, transaction semantics, or schema migrations. Use the deployment-compatible database engine for those checks. Stub live third-party services at the boundary rather than coupling tests to the public network.

| Aspect | Layered Architecture | Vertical Slice |
|---|---|---|
| Test boundary | Layer interface | Slice entry/exit |
| Typical boundary check | Layer interface tests | Slice integration tests for wiring and side effects |
| Test doubles | Often used across layer interfaces | Use at boundaries that are not the behavior under test |
| Regression risk per change | High (shared layer changes) | Low (isolated slice changes) |

---

## Synergy with CQRS and Event Modeling

VSA and CQRS reinforce each other naturally. Each slice is inherently either a command (write) or a query (read). This separation lets you use different persistence strategies per side and tailor implementation complexity per slice — a simple query can be raw SQL while a complex command uses a rich domain model.

When combined with Event Modeling, the system design maps directly to implementation: every modeled state change, state view, or automation becomes a discrete vertical slice. This eliminates ambiguity about where code belongs.

---

## Evolution and Migration

### The Evolution Path

VSA provides a natural migration path toward distributed systems:

1. **Start as a well-structured monolith.** Slices organized under business-capability folders. Single deployable. Fast iteration.
2. **Introduce module boundaries.** Enforce that modules communicate only through public APIs or events — never by reaching into another module's internals. Tools like Spring Modulith or ArchUnit can enforce these boundaries at build time.
3. **Extract selectively.** When a module needs independent scaling, deployment, or team ownership, extract it into a service. The module boundary is already the service boundary. Defer the distributed systems tax until the evidence demands it.

### Migrating from an Existing Layered Codebase

Most teams adopting VSA are not starting greenfield. Apply the **Strangler Fig pattern per feature:**

1. **Pick the easiest slice, not the most important one.** Choose a feature with clear boundaries, low coupling to other layers, and high business value — low risk, high visibility.
2. **Implement the new slice alongside the old code.** The new slice lives in a `Features/` or `Modules/` folder. The old controller, service, and repository remain in place. Route traffic to the new slice.
3. **Delete the old code once the slice is stable.** Remove the controller method, the service method, and (if unused elsewhere) the repository method. Do not leave the old code as a fallback — that creates two systems to maintain.
4. **Repeat, expanding slice by slice.** Each migrated feature shrinks the layered code and grows the sliced code. Over time, the layered structure becomes the minority and can be retired entirely.

**Key rules during migration:**

- New features always go into the slice structure. Never add new code to the layered codebase.
- Resist the urge to create a "compatibility layer" between old and new. If a slice needs data that an old service provides, query the database directly rather than calling the old service.
- Accept that the codebase will be hybrid for a period. This is normal and manageable as long as the direction is clear.

---

## Common Anti-Patterns

**The "Common" junk drawer.** A `Shared/` or `Common/` project that grows unbounded, coupling unrelated features. Use the three-tier sharing framework instead.

**Slice-to-slice coupling.** One slice importing another slice's handler or internal types. This destroys independence. Use events, shared domain entities, or direct database queries instead.

**Over-abstracting within slices.** Introducing repository interfaces, service abstractions, and mapper layers inside a single slice. If the slice has one consumer, it needs zero abstraction. Use framework APIs (ORM, HTTP client) directly.

**Ignoring code smells as slices grow.** A handler that balloons to 200+ lines needs refactoring — push logic into the domain model, extract value objects, or split the slice into finer-grained use cases.

**Mandating uniformity across slices.** One of VSA's strengths is that each slice can use the best tool for its job. A simple GET can be raw SQL; a complex command can involve a full aggregate. Resist the urge to enforce a single implementation pattern everywhere.

**Fat aggregates as hidden monoliths.** An aggregate that every slice in a module writes to becomes a bottleneck — both for concurrency and for reasoning about change. Split aggregates along invariant boundaries, not convenience.

**BFF scope creep.** A Backend-for-Frontend that starts as a thin mapping layer and gradually accumulates business logic, validation, and its own data store. It becomes a second application coupled to every slice it touches.
