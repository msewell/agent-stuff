---
name: designing-deep-modules
description: "Guides designing, reviewing, and refactoring modules for depth — maximizing functionality hidden behind minimal interfaces. Analyzes module boundaries, identifies shallow modules and classitis, applies deep module heuristics (pull complexity downward, define errors out of existence, design for the common case), and produces refactoring plans. Covers information hiding, leaky abstractions, and abstraction boundaries based on Ousterhout's A Philosophy of Software Design. Use when designing module interfaces, reviewing code for shallow abstractions, refactoring pass-through layers, evaluating API surface area, reducing interface complexity, or applying deep module principles at any scale (functions, classes, packages, services, APIs)."
category: System Architecture
---

# Deep Module Design

A **deep module** hides substantial complexity behind a small, simple interface. A **shallow module** exposes an interface nearly as complex as its implementation. "Module" means any abstraction boundary: function, class, package, service, or API.

Every module has:

- **Cost**: its interface — parameters, methods, exceptions, configuration, preconditions, side effects, imported types
- **Benefit**: the functionality hidden behind that interface

A module justifies its existence only when benefit substantially exceeds cost.

## Workflow: Designing a new module

1. Identify the design decision the module will hide (storage format, protocol, business rule, algorithm).
2. Design the interface for the 90% common case first — zero unnecessary parameters, zero ceremony.
3. Verify the interface is expressed in terms of what the module *does*, not how it does it.
4. Pull complexity downward: if a decision can be made internally with reasonable defaults, make it internally.
5. Define errors out of existence: if the module can satisfy the caller's intent without surfacing an error, do so.
6. Add escape hatches for the 10% case only where genuinely needed, without complicating the common path.
7. Verify: articulate what significant decision the module hides. If you cannot, it may be too shallow.

## Workflow: Reviewing existing code for depth

1. Identify module clusters with these shallow signals:
   - Long call chains (4+ layers before real work happens)
   - Mirror interfaces (classes with nearly identical method signatures)
   - Forced co-changes (feature change requires 5+ files across 3+ modules)
   - Thin wrappers (implementations that are a single delegation)
   - Ceremony-heavy common operations (multiple instantiations for simple tasks)
2. For each suspect module, assess: does the interface cost justify the benefit?
3. Apply the decision framework below to determine the action.

## Workflow: Refactoring shallow modules into deep ones

1. **Map actual decisions.** List the design decisions scattered across the shallow cluster — these are what the deep module will hide.
2. **Merge toward depth.** Combine shallow modules into fewer, deeper ones, each owning a meaningful, complete responsibility.
3. **Internalize pass-throughs.** For every pass-through method, absorb it into the module that does real work, or eliminate it.
4. **Collapse exception hierarchies.** Replace fine-grained exception types with a single clear error, or handle internally.
5. **Simplify the common-case interface.** Default parameters, compute configuration internally, handle errors without involving the caller.
6. **Verify the module hides a real decision.** If you cannot articulate what it hides, it is still too shallow.

For detailed explanations with before/after code examples, see [references/02-heuristics-and-refactoring.md](references/02-heuristics-and-refactoring.md).

## Decision framework

| Signal | Action |
|---|---|
| Class has more public methods than internal decisions it hides | Merge with related classes or reduce public surface |
| Two modules always change together | Combine into one module |
| Method implementation ≈ its signature | Eliminate; let callers use the underlying module |
| Common case requires >2 steps or >3 parameters | Redesign interface for the common case |
| Module exposes configuration it could compute | Compute internally; remove the parameter |
| Module throws exceptions caller cannot meaningfully handle | Handle internally or define out of existence |
| Service is a thin wrapper over a database table | Absorb into a service with real domain logic |
| Splitting would produce modules with similar interfaces | Do not split |
| Understanding module A requires reading modules B and C | Merge A, B, and C |

## Key heuristics

1. **Pull complexity downward.** Simple interface beats simple implementation.
2. **Define errors out of existence.** `delete(file)` succeeds if file is already gone. `getOrDefault(key, default)` never throws "not found."
3. **Design the common case first.** The 90% path should be trivially easy.
4. **Prefer general-purpose interfaces.** `modifyText(range, replacement)` is deeper than `insertAfterCursor()` + `deleteBeforeCursor()` + `deleteSelection()`.
5. **Combine modules that share knowledge.** If two modules depend on the same data format or business rule, they should likely be one module.
6. **Separate only when interfaces are truly distinct.** If consumers always use two modules together, the separation is not earning its cost.
7. **Measure interface cost honestly.** Include parameters, exceptions, preconditions, ordering constraints, side effects, configuration, and imported types — not just method count.
8. **Avoid wrappers unless they add real logic.** A wrapper's interface cost rarely justifies a small behavioral tweak.

For detailed explanations and code examples for each heuristic, see [references/02-heuristics-and-refactoring.md](references/02-heuristics-and-refactoring.md).

## When shallow modules are acceptable

- **Genuine extension points** — plugin interfaces, middleware hooks where the interface *is* the product.
- **Dispatchers/routers** — routing to the correct deep module is a legitimate structural role.
- **Cross-cutting infrastructure** — logging decorators, metrics wrappers designed to be thin and transparent.

These are exceptions, not justifications for a system full of shallow modules.

## Reference material

- **Foundations, examples, and antipatterns**: [references/01-foundations-and-antipatterns.md](references/01-foundations-and-antipatterns.md) — cost/benefit model, characteristics of deep modules, canonical examples (Unix I/O, garbage collectors, Go interfaces), classitis, pass-through methods, configuration parameters, excessive exceptions, the principle applied at every scale
- **Heuristics and refactoring details**: [references/02-heuristics-and-refactoring.md](references/02-heuristics-and-refactoring.md) — detailed design heuristics with code examples, step-by-step refactoring workflow with before/after code examples
