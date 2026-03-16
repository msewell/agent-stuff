---
name: applying-vertical-slice-architecture
description: "Designs, reviews, and migrates codebases using Vertical Slice Architecture (VSA) — organizing by business capability instead of technical layer. Produces slice boundaries, folder structures, sharing strategies, and migration plans. Use when designing a new VSA codebase, reviewing an existing VSA codebase for anti-patterns, migrating from layered architecture to vertical slices, deciding slice granularity or folder organization, handling shared code across slices, or when the user mentions vertical slices, feature folders, or organizing by use case."
category: System Architecture
---

# Applying Vertical Slice Architecture

Treat slices as self-contained behaviors, not miniature layered architectures. See [references/01-foundations-and-structure.md](references/01-foundations-and-structure.md) § Core Mental Model for the full framing.

## Workflow: Designing a new VSA codebase

1. **Assess fit.** Confirm VSA suits the project. See [references/01-foundations-and-structure.md](references/01-foundations-and-structure.md) § Decision Framework.
   - VSA excels for systems with distinct use cases where requirements change per feature.
   - VSA struggles when core domain invariants must be enforced identically across many operations, or the app is trivially small CRUD.
   - VSA and Clean Architecture are orthogonal — one governs dependency direction, the other governs the axis of organization.
2. **Define slice granularity.** Each slice = one use case, named with a verb-noun pair (`BookAppointment`, `GetInvoice`). Group related slices under business-capability modules. See [references/01-foundations-and-structure.md](references/01-foundations-and-structure.md) § Defining Slice Granularity for right-sizing heuristics.
3. **Choose folder structure.** Start with single-file-per-feature (Option A). Promote to feature folders (Option B) or module nesting (Option C) when complexity warrants it. See [references/01-foundations-and-structure.md](references/01-foundations-and-structure.md) § Folder Structure Strategies for examples and trade-offs.
4. **Handle shared code using three tiers:**
   - **Tier 1 — Infrastructure** (share freely): logging, auth middleware, Result pattern → `SharedKernel/`
   - **Tier 2 — Domain concepts** (share through entities): business rules live on entities/value objects, not service classes
   - **Tier 3 — Feature-local** (keep near slices): if only one module needs it, keep it in that module's `Shared/`
5. **Use framework mechanisms for cross-cutting concerns.** Middleware, pipeline behaviors, interceptors — not per-slice boilerplate. Individual slices contain zero cross-cutting code.
6. **Mirror slice boundaries in the frontend.** What changes together lives together, across the full stack. See [references/01-foundations-and-structure.md](references/01-foundations-and-structure.md) § Full-Stack Slice Co-location.

## Workflow: Reviewing a VSA codebase

1. **Apply the screaming architecture test.** Can a new team member look at the top-level folder tree and understand what the system does? Business capabilities (`Scheduling/`, `Billing/`), not technology (`Controllers/`, `Services/`).
2. **Check for anti-patterns.** See [references/02-sharing-testing-and-evolution.md](references/02-sharing-testing-and-evolution.md) § Common Anti-Patterns. Key signals:
   - A `Common/` or `Shared/` junk drawer coupling unrelated features
   - One slice importing another slice's handler or internal types
   - Repository interfaces, service abstractions, or mapper layers inside a single-consumer slice
   - Handlers exceeding ~200 lines without domain model extraction
   - A BFF layer accumulating business logic
3. **Audit shared code.** Apply the three-tier framework. Check that feature-local sharing stays within its module and no premature abstractions exist (Rule of Three).
4. **Assess aggregate health.** Fat aggregates that every slice writes to are hidden monoliths. Split along invariant boundaries. See [references/01-foundations-and-structure.md](references/01-foundations-and-structure.md) § Aggregate Boundaries vs. Slice Boundaries.

## Workflow: Migrating from layered architecture

Apply the Strangler Fig pattern per feature:

1. **Pick the easiest slice** (clear boundaries, low coupling, high visibility) — not the most important one. Build confidence in the process first.
2. **Implement the new slice alongside old code** in a `Features/` or `Modules/` folder. Route traffic to the new slice.
3. **Delete old code** (controller, service, repository) once the slice is stable. Do not keep it as a fallback.
4. **Repeat.** New features always go in slices; never add new code to the layered structure.
5. **Accept a hybrid period.** This is normal — maintain clear direction. See [references/02-sharing-testing-and-evolution.md](references/02-sharing-testing-and-evolution.md) § Evolution and Migration for the full evolution path.

## Key principles

1. **One slice = one use case.** Name it verb-noun. If you can't, the boundary is wrong.
2. **Start simple, refactor when it hurts.** Begin with transaction-script handlers. Extract domain objects when complexity warrants it.
3. **Keep slices rewritable.** Target roughly a day of work per slice.
4. **Test at the edges.** Integration tests against the slice boundary. Unit tests only for complex domain logic. Minimal mocking. See [references/02-sharing-testing-and-evolution.md](references/02-sharing-testing-and-evolution.md) § Testing Strategy.
5. **Share through the domain model, not services.** Entities and value objects are the sharing mechanism. Service classes multiple slices depend on are a coupling vector.
6. **Prefer small aggregates.** Fewer slices contending over shared aggregates means less coupling and fewer concurrency conflicts.
7. **Enforce module boundaries explicitly.** Use build-time tooling (ArchUnit, Spring Modulith) to prevent accidental cross-module coupling.
8. **Migrate incrementally.** Strangler Fig per feature — never a big-bang rewrite.

## Detailed reference material

- **Foundations & structure**: [references/01-foundations-and-structure.md](references/01-foundations-and-structure.md) — decision framework, slice granularity heuristics, folder structures, full-stack co-location, aggregate boundaries
- **Sharing, testing & evolution**: [references/02-sharing-testing-and-evolution.md](references/02-sharing-testing-and-evolution.md) — three-tier sharing, cross-cutting concerns, BFF trap, eventual consistency, testing strategy, CQRS synergy, migration patterns, anti-patterns
